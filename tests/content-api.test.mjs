import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('', { url: 'https://www.duldoljimi.com' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.NodeFilter = dom.window.NodeFilter;

async function loadClient(base) {
  const result = await build({
    entryPoints: ['src/lib/content-api.ts'],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
    define: { 'import.meta.env': JSON.stringify({ VITE_CONTENT_API_URL: base }) },
  });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}

const api = await loadClient('/api');
const legacy = await loadClient('');

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

test('configured API uses credentials and rejects redirects; failures never read legacy files', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return json({ error: { code: 'UNAVAILABLE', message: '잠시 후 다시 시도해주세요.' } }, 503);
  };
  await assert.rejects(api.getPosts(), error => error.status === 503);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/api/posts');
  assert.equal(calls[0].options.credentials, 'include');
  assert.equal(calls[0].options.redirect, 'error');
  assert.equal(api.contentApiUrl('/api/posts'), '/api/posts');
});

test('session handles unauthenticated API, Access HTML and browser CORS/redirect rejection', async () => {
  globalThis.fetch = async () => json({ authenticated: false, login_url: '/api/admin/login?return_to=%2Fmemo' }, 401);
  assert.deepEqual(await api.adminSession(), { authenticated: false, login_url: '/api/admin/login?return_to=%2Fmemo' });

  globalThis.fetch = async () => new Response('<html>Sign in to Cloudflare Access</html>');
  assert.deepEqual(await api.adminSession(), { authenticated: false, login_url: '/api/admin/login?return_to=%2FEditor' });

  globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
  assert.equal((await api.adminSession()).authenticated, false);
  await assert.rejects(api.getPage('cv'), TypeError);
});

test('public posts normalize metadata and route slugs and timestamps without losing Korean text', async () => {
  globalThis.fetch = async () => json({ posts: [{ id: '1772618949198', slug: '웅얼벽화합창', title: '웅얼벽화합창', work_date: '2026-03-04', cover_asset_key: 'migration/a.jpg' }] });
  const [post] = await api.getPosts();
  assert.equal(post.hashdate, 1772618949198);
  assert.equal(post.year, '2026-03-04');
  assert.equal(api.postCover(post), '/api/media/migration/a.jpg');
  assert.equal(decodeURIComponent(api.postPath(post)), '/Works/웅얼벽화합창');

  let requested;
  globalThis.fetch = async url => {
    requested = url;
    return json({ post: { ...post, content_html: '<p>작품 설명</p>' } });
  };
  assert.equal((await api.getPost('1772618949198')).title, '웅얼벽화합창');
  assert.equal(requested, '/api/posts/1772618949198');
});

test('legacy reads stay available without an API but private memo never uses static fallback', async () => {
  const calls = [];
  globalThis.fetch = async url => {
    calls.push(url);
    return json({ posts: [{ title: 'metamorphosis', year: '2023-01-01', hashdate: 0 }] });
  };
  const [post] = await legacy.getPosts();
  assert.equal(legacy.postPath(post), '/Works/metamorphosis');
  assert.equal(legacy.postCover(post), '/images/Works/metamorphosis/title.jpg');
  await assert.rejects(legacy.getAdminPage('memo'), error => error.status === 503);
  await assert.rejects(legacy.getPage('memo'), error => error.status === 403);
  assert.deepEqual(calls, ['/Posts.json']);
});

test('sanitizer preserves formatting, public/private media and trusted Vimeo; rejects active HTML', () => {
  const clean = api.sanitizeContentHtml('<p class="leading-6" style="text-align:center">설명</p><img src="/api/admin/media/private/a.jpg" onerror="alert(1)"><svg onload="alert(1)"><script>alert(2)</script></svg><script>alert(3)</script><a href="javascript:alert(4)">link</a><iframe src="https://evil.example/embed" srcdoc="bad"></iframe><iframe src="https://player.vimeo.com/video/898474520" allowfullscreen></iframe><img src="data:image/svg+xml,bad"><img src="blob:https://example.com/123">');
  const template = document.createElement('template');
  template.innerHTML = clean;
  assert.equal(template.content.querySelector('p').className, 'leading-6');
  assert.equal(template.content.querySelector('p').style.textAlign, 'center');
  assert.equal(template.content.querySelectorAll('img').length, 1);
  assert.equal(template.content.querySelector('img').getAttribute('src'), '/api/admin/media/private/a.jpg');
  assert.equal(template.content.querySelectorAll('script,svg,[onerror],[onload],[srcdoc]').length, 0);
  assert.equal(template.content.querySelector('a').hasAttribute('href'), false);
  assert.equal(template.content.querySelectorAll('iframe').length, 1);
  assert.equal(template.content.querySelector('iframe').src, 'https://player.vimeo.com/video/898474520');
});

test('legacy text markers cannot bypass URL filtering, and gallery captions stay aligned', () => {
  const clean = api.sanitizeContentHtml('<p>[슬라이더입니다!] images=&lt;&lt;&lt;javascript:alert(1)#$%^https://images.example/a.jpg#$%^/api/media/b.jpg&gt;&gt;&gt; images_cap=&lt;&lt;&lt;unsafe#$%^첫 사진#$%^둘째 사진&gt;&gt;&gt; [!슬라이더입니다]</p><p>[비디오입니다!] Videourl=&lt;&lt;&lt;javascript:alert(2)&gt;&gt;&gt; [!비디오입니다]</p>');
  const template = document.createElement('template');
  template.innerHTML = clean;
  const text = template.content.textContent;
  assert.ok(text.includes('images=<<<https://images.example/a.jpg#$%^/api/media/b.jpg>>>'));
  assert.ok(text.includes('images_cap=<<<첫 사진#$%^둘째 사진>>>'));
  assert.ok(!text.includes('javascript:'));
  assert.ok(!text.includes('[비디오입니다!]'));

  const video = api.sanitizeContentHtml('<p>[비디오입니다!] Videourl=&lt;&lt;&lt;https://player.vimeo.com/video/898474520&gt;&gt;&gt; [!비디오입니다]</p>');
  assert.ok(video.includes('[비디오입니다!]'));
  assert.ok(video.includes('player.vimeo.com/video/898474520'));
});
