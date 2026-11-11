import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  LEGACY_POSTS, MIME_EXTENSIONS, hashBytes, inspectHtml, insertSql,
  parseDataImage, rewriteMediaHtml, sqlLiteral,
} from './migration-lib.mjs';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const publicRoot = path.join(root, 'public');
const args = process.argv.slice(2);
const getOption = name => {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${name} requires a value`);
  return args[index + 1];
};
const allowedArguments = new Set(['--out', '--import-external', '--help']);
for (let i = 0; i < args.length; i++) {
  if (!allowedArguments.has(args[i])) throw new Error(`Unknown argument: ${args[i]}`);
  if (args[i] === '--out') i++;
}
if (args.includes('--help')) {
  console.log('node scripts/prepare-cloudflare-migration.mjs [--out .migration] [--import-external]');
  console.log('Writes local manifests, SQL and asset copies only. Network reads require --import-external.');
  process.exit(0);
}
const outputRoot = path.resolve(root, getOption('--out') || '.migration');
if (outputRoot === root || !outputRoot.startsWith(root + path.sep)) {
  throw new Error('--out must name a child directory inside this repository');
}
const importExternal = args.includes('--import-external');
const generatedAt = new Date().toISOString();
const report = {
  errors: [], warnings: [], extractedPrivateInlineImages: 0,
  legacy: [], activeDocuments: [], unlistedDirectories: [],
};
const assets = new Map();
const externalAssets = new Map();
const urlCache = new Map();
const require = createRequire(import.meta.url);

await mkdir(path.join(outputRoot, 'assets'), { recursive: true });
const postsJson = JSON.parse(await readFile(path.join(publicRoot, 'Posts.json'), 'utf8'));
if (!Array.isArray(postsJson.posts)) throw new Error('Posts.json has no posts array');
const listedPosts = postsJson.posts;
let historicalPosts = [];
try { historicalPosts = JSON.parse(await readFile(path.join(publicRoot, 'a.json'), 'utf8')).posts || []; }
catch { report.warnings.push('Historical a.json was unavailable; unknown legacy dates remain empty.'); }

const extensionMimes = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif',
  '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.bmp': 'image/bmp',
};

async function registerAsset(bytes, mimeType, originalFilename, sourceUrl, visibility = 'public') {
  const digest = hashBytes(bytes);
  const extension = MIME_EXTENSIONS[mimeType];
  if (!extension) throw new Error(`Unsupported image MIME type ${mimeType}: ${sourceUrl}`);
  const key = `migration/${visibility === 'private' ? 'private/' : ''}${digest}.${extension}`;
  if (!assets.has(key)) {
    const localName = `assets/${visibility === 'private' ? 'private-' : ''}${digest}.${extension}`;
    await writeFile(path.join(outputRoot, localName), bytes);
    assets.set(key, {
      id: `${visibility === 'private' ? 'private-' : ''}${digest}`, object_key: key, mime_type: mimeType, size: bytes.length, visibility,
      original_filename: originalFilename, source_url: sourceUrl,
      status: 'ready', created_at: generatedAt, updated_at: generatedAt,
      local_file: localName, sha256: digest,
    });
  }
  return `${visibility === 'private' ? '/api/admin/media/' : '/api/media/'}${key}`;
}

function isAllowedExternal(url) {
  return url.protocol === 'https:' && url.hostname === 'lh3.googleusercontent.com'
    && !url.username && !url.password && (!url.port || url.port === '443');
}

async function downloadExternal(sourceUrl) {
  let url = new URL(sourceUrl);
  for (let redirects = 0; redirects < 5; redirects++) {
    if (!isAllowedExternal(url)) throw new Error(`External image host is not allowed: ${url.hostname}`);
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
    if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
      await response.body?.cancel();
      url = new URL(response.headers.get('location'), url);
      continue;
    }
    if (!response.ok) throw new Error(`Image download HTTP ${response.status}: ${sourceUrl}`);
    const mime = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!MIME_EXTENSIONS[mime]) throw new Error(`External URL did not return an image: ${sourceUrl}`);
    const maxBytes = 30 * 1024 * 1024;
    if (Number(response.headers.get('content-length') || 0) > maxBytes) {
      await response.body?.cancel();
      throw new Error(`External image exceeds 30 MiB: ${sourceUrl}`);
    }
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error(`External image exceeds 30 MiB: ${sourceUrl}`);
      }
      chunks.push(Buffer.from(value));
    }
    const bytes = Buffer.concat(chunks);
    if (!bytes.length) throw new Error(`External image is empty: ${sourceUrl}`);
    return { bytes, mimeType: mime };
  }
  throw new Error(`Too many redirects downloading ${sourceUrl}`);
}

async function resolveMediaUrl(rawUrl, document, privatePage = false) {
  const sourceUrl = rawUrl.trim();
  const visibility = privatePage ? 'private' : 'public';
  const cacheKey = `${visibility}:${sourceUrl}`;
  if (!sourceUrl) return rawUrl;
  if (sourceUrl.startsWith('blob:')) {
    report.errors.push({ document, reason: 'A blob URL cannot be migrated; select its original image.', url: sourceUrl });
    return rawUrl;
  }
  if (sourceUrl.startsWith('data:image/')) {
    if (privatePage) report.extractedPrivateInlineImages++;
    const inlineKey = `${visibility}:${hashBytes(Buffer.from(sourceUrl))}`;
    if (!urlCache.has(inlineKey)) {
      const { bytes, mimeType } = parseDataImage(sourceUrl);
      urlCache.set(inlineKey, await registerAsset(bytes, mimeType, `inline.${MIME_EXTENSIONS[mimeType]}`, `inline:${inlineKey}`, visibility));
    }
    return urlCache.get(inlineKey);
  }
  if (/^https:\/\/lh3\.googleusercontent\.com\//i.test(sourceUrl)) {
    if (!externalAssets.has(sourceUrl)) externalAssets.set(sourceUrl, { source_url: sourceUrl, documents: [], status: 'external' });
    const item = externalAssets.get(sourceUrl);
    if (!item.documents.includes(document)) item.documents.push(document);
    if (!importExternal) return rawUrl;
    if (!urlCache.has(cacheKey)) {
      try {
        const { bytes, mimeType } = await downloadExternal(sourceUrl);
        const newUrl = await registerAsset(bytes, mimeType, `google-${new URL(sourceUrl).pathname.split('/').pop()}.${MIME_EXTENSIONS[mimeType]}`, sourceUrl, visibility);
        urlCache.set(cacheKey, newUrl);
        item.status = 'downloaded';
        item.object_key = newUrl.slice((privatePage ? '/api/admin/media/' : '/api/media/').length);
      } catch (error) {
        item.status = 'failed';
        report.errors.push({ document, reason: error.message, url: sourceUrl });
        urlCache.set(cacheKey, rawUrl);
      }
    }
    return urlCache.get(cacheKey);
  }
  if (/^https?:|^\/\//i.test(sourceUrl)) return rawUrl;
  if (!sourceUrl.startsWith('/images/') && !sourceUrl.startsWith('/Posts/')) return rawUrl;
  if (urlCache.has(cacheKey)) return urlCache.get(cacheKey);
  let relative;
  try { relative = decodeURIComponent(sourceUrl.split(/[?#]/)[0]).replace(/^\/+/, ''); }
  catch { throw new Error(`Invalid local asset URL in ${document}`); }
  const filename = path.resolve(publicRoot, relative);
  if (!filename.startsWith(publicRoot + path.sep)) throw new Error(`Asset path escapes public directory: ${sourceUrl}`);
  try {
    const mime = extensionMimes[path.extname(filename).toLowerCase()];
    const newUrl = await registerAsset(await readFile(filename), mime, path.basename(filename), sourceUrl, visibility);
    urlCache.set(cacheKey, newUrl);
    return newUrl;
  } catch (error) {
    report.errors.push({ document, reason: error.message, url: sourceUrl });
    return rawUrl;
  }
}

async function renderSource(relativePath, stripLegacyHeader = false) {
  const result = await build({
    entryPoints: [path.join(root, relativePath)], bundle: true, write: false,
    platform: 'node', format: 'cjs', jsx: 'automatic', packages: 'external',
    plugins: [{
      name: 'legacy-content-renderer',
      setup(builder) {
        builder.onResolve({ filter: /^react(?:\/.*)?$/ }, args => ({ path: args.path, external: true }));
        builder.onResolve({ filter: /^\/images\// }, args => ({ path: args.path, namespace: 'asset-url' }));
        builder.onLoad({ filter: /.*/, namespace: 'asset-url' }, args => ({ contents: `export default ${JSON.stringify(args.path)};`, loader: 'js' }));
        builder.onResolve({ filter: /\.(scss|css)$/ }, () => ({ path: 'empty-style', namespace: 'empty' }));
        builder.onLoad({ filter: /.*/, namespace: 'empty' }, () => ({ contents: '', loader: 'js' }));
        builder.onResolve({ filter: /^@\/components\/Slick$/ }, () => ({ path: 'slider', namespace: 'legacy-slider' }));
        builder.onLoad({ filter: /.*/, namespace: 'legacy-slider' }, () => ({
          loader: 'jsx', contents: `import React from 'react';
            export default function Slick({images, images_cap}) {
              return <p>{'------ [슬라이더입니다!] images=<<<' + images.join('#$%^')
                + '>>> images_cap=<<<' + images_cap.join('#$%^') + '>>> [!슬라이더입니다] ------'}</p>;
            }`,
        }));
        builder.onResolve({ filter: /^recoil$/ }, () => ({ path: 'recoil', namespace: 'render-state' }));
        builder.onLoad({ filter: /.*/, namespace: 'render-state' }, () => ({
          contents: 'export const atom = config => config; export const useRecoilState = atom => [atom.default, () => {}];', loader: 'js',
        }));
        builder.onResolve({ filter: /^@\// }, args => ({ path: path.resolve(root, 'src', args.path.slice(2) + (path.extname(args.path) ? '' : '.tsx')) }));
      },
    }],
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, module, module.exports);
  const Component = module.exports.default;
  const completeHtml = renderToStaticMarkup(React.createElement(Component));
  if (!stripLegacyHeader) return { html: completeHtml, completeHtml };
  const body = () => {
    const element = Component();
    if (!React.isValidElement(element) || element.type !== 'div') throw new Error(`Unexpected legacy root in ${relativePath}`);
    const children = React.Children.toArray(element.props.children);
    const headerIndex = children.findIndex(child => React.isValidElement(child) && child.type === 'div'
      && /\bflex\b/.test(child.props.className || '')
      && React.Children.toArray(child.props.children).some(nested => React.isValidElement(nested) && nested.type === 'img')
      && React.Children.toArray(child.props.children).some(nested => React.isValidElement(nested) && nested.type === 'span'));
    if (headerIndex !== 0) throw new Error(`Could not identify first title/image header in ${relativePath}`);
    return React.createElement(React.Fragment, null, ...children.filter((_, index) => index !== headerIndex));
  };
  return { html: renderToStaticMarkup(React.createElement(body)), completeHtml };
}

const rows = [];
const originalLegacy = [];
const featured = [...listedPosts].sort((a, b) => Date.parse(b.year) - Date.parse(a.year)).slice(0, 3);
async function makePost({ id, slug, title, year, content, cover, listedIndex, legacyHtml }) {
  const contentHtml = await rewriteMediaHtml(content, url => resolveMediaUrl(url, `post:${slug}`));
  const coverUrl = await resolveMediaUrl(cover || '', `cover:${slug}`);
  const key = coverUrl.startsWith('/api/media/') ? coverUrl.slice('/api/media/'.length) : null;
  const featuredIndex = featured.findIndex(post => String(post.hashdate === 0 ? post.title : post.hashdate) === slug);
  const row = {
    id, slug, title, work_date: year || '', content_html: contentHtml,
    cover_asset_key: key, cover_url: key ? null : coverUrl || null,
    is_listed: listedIndex >= 0 ? 1 : 0, status: 'published',
    sort_order: listedIndex >= 0 ? listedIndex : 1000 + rows.length,
    featured_order: featuredIndex >= 0 ? featuredIndex : null,
    version: 1, created_at: generatedAt, updated_at: generatedAt,
  };
  rows.push(row);
  report.activeDocuments.push({ document: `post:${slug}`, before: inspectHtml(content), after: inspectHtml(contentHtml) });
  if (legacyHtml !== undefined) originalLegacy.push({ id, slug, html: legacyHtml });
}

for (const [index, title] of LEGACY_POSTS.entries()) {
  const listedIndex = listedPosts.findIndex(post => post.hashdate === 0 && post.title === title);
  const metadata = listedPosts.find(post => post.title === title) || historicalPosts.find(post => post.title === title);
  const relativePath = `src/components/initpages/PostComponent${index + 1}.tsx`;
  const rendered = await renderSource(relativePath, true);
  let cover = `/images/Works/${title}/title.jpg`;
  try { await stat(path.join(publicRoot, 'images', 'Works', title, 'title.jpg')); }
  catch {
    cover = /<img\b[^>]*\bsrc="([^"]+)"/.exec(rendered.completeHtml)?.[1] || '';
    report.warnings.push({ document: `post:${title}`, reason: 'Missing legacy title.jpg; used original header image.' });
  }
  if (!metadata?.year) report.warnings.push({ document: `post:${title}`, reason: 'Unknown historical date; work_date is empty.' });
  await makePost({ id: `legacy-${index + 1}`, slug: title, title, year: metadata?.year,
    content: rendered.html, cover, listedIndex, legacyHtml: rendered.completeHtml });
  report.legacy.push({ title, component: relativePath, listed: listedIndex >= 0 });
}

for (const [listedIndex, post] of listedPosts.entries()) {
  if (post.hashdate === 0) continue;
  const id = String(post.hashdate);
  if (!/^\d+$/.test(id)) throw new Error('Unexpected numeric post identifier');
  const directory = path.join(publicRoot, 'Posts', 'Works', id);
  const content = await readFile(path.join(directory, 'main.html'), 'utf8');
  const title = (await readFile(path.join(directory, 'titlename.txt'), 'utf8')).split('\n')[0].trim();
  if (title !== post.title) report.warnings.push({ document: `post:${id}`, reason: 'JSON title differs from displayed titlename.txt; retained displayed title.', json_title: post.title, displayed_title: title });
  await makePost({ id, slug: id, title, year: post.year, content, cover: post.titleimg, listedIndex });
}

const pages = [];
for (const [slug, title, visibility] of [
  ['note', 'Note', 'public'], ['cv', 'CV', 'public'], ['memo', 'Memo', 'private'], ['contact', 'Contact', 'public'],
]) {
  const original = slug === 'contact'
    ? await readFile(path.join(root, 'scripts', 'legacy-content', 'contact.html'), 'utf8')
    : await readFile(path.join(publicRoot, 'Posts', `${slug}.html`), 'utf8');
  const contentHtml = await rewriteMediaHtml(original, url => resolveMediaUrl(url, `page:${slug}`, visibility === 'private'));
  pages.push({ slug, title, content_html: contentHtml, visibility, version: 1, created_at: generatedAt, updated_at: generatedAt });
  report.activeDocuments.push({ document: `page:${slug}`, before: inspectHtml(original), after: inspectHtml(contentHtml) });
}

for (const directory of await readdir(path.join(publicRoot, 'Posts', 'Works'), { withFileTypes: true })) {
  if (!directory.isDirectory() || rows.some(row => row.slug === directory.name)) continue;
  const folder = path.join(publicRoot, 'Posts', 'Works', directory.name);
  let html = '';
  try { html = await readFile(path.join(folder, 'main.html'), 'utf8'); } catch { /* Old upload folders may have only images. */ }
  const files = await readdir(folder, { withFileTypes: true });
  let bytes = 0;
  for (const file of files) if (file.isFile()) bytes += (await stat(path.join(folder, file.name))).size;
  report.unlistedDirectories.push({ path: `public/Posts/Works/${directory.name}`, files: files.filter(file => file.isFile()).length,
    bytes, html: inspectHtml(html), disposition: 'retained; not copied or deleted; review before importing' });
}

const slugs = rows.map(row => row.slug);
if (new Set(slugs).size !== slugs.length) report.errors.push({ reason: 'Duplicate post slug' });
if (rows.filter(row => row.is_listed).length !== listedPosts.length) report.errors.push({ reason: 'Listed post count changed' });
const mediaReferences = [];
for (const [ownerType, owners] of [['post', rows], ['page', pages]]) {
  for (const owner of owners) {
    const keys = new Set([...owner.content_html.matchAll(/\/api\/(?:admin\/)?media\/(migration\/(?:private\/)?[a-f0-9]{64}\.[a-z]+)/g)].map(match => match[1]));
    if (owner.cover_asset_key) keys.add(owner.cover_asset_key);
    for (const key of keys) {
      const asset = assets.get(key);
      if (!asset) report.errors.push({ reason: 'Media reference has no upload asset', object_key: key });
      else mediaReferences.push({ media_id: asset.id, owner_type: ownerType, owner_id: owner.id || owner.slug });
    }
  }
}
const summary = {
  posts: rows.length, listedPosts: rows.filter(row => row.is_listed).length, pages: pages.length,
  assets: assets.size, assetBytes: [...assets.values()].reduce((sum, asset) => sum + asset.size, 0),
  externalAssets: externalAssets.size,
  remainingExternalAssets: [...externalAssets.values()].filter(asset => asset.status !== 'downloaded').length,
  unlistedDirectories: report.unlistedDirectories.length, errors: report.errors.length, warnings: report.warnings.length,
};
const manifest = { schema_version: 1, generated_at: generatedAt, mode: importExternal ? 'local-with-external-downloads' : 'local-only',
  media_base: '/api/media/', summary, posts: rows, pages, assets: [...assets.values()], media_references: mediaReferences,
  external_assets: [...externalAssets.values()], report };
await writeFile(path.join(outputRoot, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(path.join(outputRoot, 'assets.json'), JSON.stringify({ generated_at: generatedAt, assets: [...assets.values()] }, null, 2) + '\n');
await writeFile(path.join(outputRoot, 'external-assets.json'), JSON.stringify([...externalAssets.values()], null, 2) + '\n');
await writeFile(path.join(outputRoot, 'legacy-rendered.json'), JSON.stringify(originalLegacy, null, 2) + '\n');
await writeFile(path.join(outputRoot, 'report.json'), JSON.stringify({ summary, ...report }, null, 2) + '\n');
if (report.errors.length) {
  await writeFile(path.join(outputRoot, 'content.sql'), '-- BLOCKED: review report.json and rerun. No import statements generated.\n');
  console.error(JSON.stringify(summary, null, 2));
  console.error('Migration is blocked. See report.json; no runnable content SQL was generated.');
  process.exitCode = 1;
} else {
  const sql = [
    '-- Generated locally. Upload R2 objects before importing this file. Never commit this output: it includes private memo content.',
    '-- Existing rows with version > 1 are preserved. Run initial schema migrations first.',
    ...[...assets.values()].map(({ local_file, sha256, ...row }) => insertSql('media', row, 'object_key')),
    ...rows.map(row => insertSql('posts', row, 'id', true)),
    ...pages.map(row => insertSql('pages', row, 'slug', true)),
    ...mediaReferences.map(row => `INSERT OR IGNORE INTO media_references (media_id,owner_type,owner_id) VALUES (${sqlLiteral(row.media_id)},${sqlLiteral(row.owner_type)},${sqlLiteral(row.owner_id)});`),
  ].join('\n') + '\n';
  await writeFile(path.join(outputRoot, 'content.sql'), sql);
  console.log(JSON.stringify(summary, null, 2));
  console.log(`Prepared ${path.relative(root, outputRoot)} locally. No Cloudflare or GitHub writes were made.`);
  if (summary.remainingExternalAssets) console.log('External image URLs remain. Rerun with --import-external to download and replace them after reviewing external-assets.json.');
}
