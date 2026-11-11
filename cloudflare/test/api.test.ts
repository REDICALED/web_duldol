import { readFileSync } from 'node:fs';
import { Miniflare } from 'miniflare';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import api from '../src/index';
import { verifyAccessJwt } from '../src/auth';
import { issueAsset, MAX_ASSET_BYTES } from '../src/media';
import type { Env } from '../src/types';

let mf: Miniflare;
let env: Env;
const origin = 'http://localhost:5173';
const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=', 'base64'));

function request(path: string, method = 'GET', body?: unknown, options: { origin?: string | null; env?: Env; host?: string; headers?: Record<string, string> } = {}) {
  const headers = new Headers(options.headers);
  if (method !== 'GET' && method !== 'HEAD') {
    if (options.origin !== null) headers.set('Origin', options.origin ?? origin);
    if (body !== undefined && !(body instanceof Uint8Array)) headers.set('Content-Type', 'application/json');
  }
  return api.fetch(new Request(`${options.host || 'http://localhost:8787'}${path}`, { method, headers, ...(body !== undefined ? { body: body instanceof Uint8Array ? body : JSON.stringify(body) } : {}) }), options.env || env);
}

async function responseJson(response: Response): Promise<any> { return response.json(); }

async function applyMigration(db: D1Database, filename: string) {
  const schema = readFileSync(new URL(`../migrations/${filename}`, import.meta.url), 'utf8');
  const statements = schema.split(';').map(sql => sql.trim()).filter(Boolean);
  await db.batch(statements.map(sql => db.prepare(sql)));
}

async function upload(visibility = 'public') {
  const response = await request('/api/admin/assets', 'POST', { filename: 'image.png', content_type: 'image/png', size: png.length, visibility });
  expect(response.status).toBe(201);
  const issued = await responseJson(response);
  const put = await request(issued.upload.url, 'PUT', png, { headers: issued.upload.headers });
  expect(put.status).toBe(200);
  const finalized = await request(issued.finalize_url, 'POST');
  expect(finalized.status).toBe(200);
  return (await responseJson(finalized)).asset;
}

beforeAll(async () => {
  mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response("test") } }', compatibilityDate: '2026-08-01', d1Databases: ['DB', 'LEGACY'], r2Buckets: ['MEDIA'] });
  env = { DB: await mf.getD1Database('DB') as unknown as D1Database, MEDIA: await mf.getR2Bucket('MEDIA') as unknown as R2Bucket, ENVIRONMENT: 'development', DEV_AUTH_BYPASS: 'true', APP_ORIGIN: origin };
  await applyMigration(env.DB, '0001_initial.sql');
  await applyMigration(env.DB, '0002_media_relationships.sql');
});

beforeEach(async () => {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM post_media'), env.DB.prepare('DELETE FROM page_media'),
    env.DB.prepare('DELETE FROM posts'), env.DB.prepare('DELETE FROM media'),
    env.DB.prepare("UPDATE pages SET title=slug,content_html='',visibility=CASE WHEN slug='memo' THEN 'private' ELSE 'public' END,version=1,revision_id=''")
  ]);
});

afterAll(async () => { await mf?.dispose(); });

describe('media schema upgrade', () => {
  it('preserves documents, URLs and existing UUIDs while migrating legacy media IDs and foreign keys', async () => {
    const db = await mf.getD1Database('LEGACY') as unknown as D1Database;
    await applyMigration(db, '0001_initial.sql');
    const oldPublicId = 'a'.repeat(64);
    const oldPrivateId = `private-${'b'.repeat(64)}`;
    const uuid = 'd02792fc-08a4-4fab-9b8e-34ea91b923dd';
    const publicKey = `migration/${oldPublicId}.png`;
    const privateKey = `migration/private/${'b'.repeat(64)}.png`;
    const body = `<p>기존 작품</p><img src="/api/media/${publicKey}">`;
    const memoBody = `<p>메모</p><img src="/api/admin/media/${privateKey}">`;
    await db.batch([
      ...[[oldPublicId, publicKey, 'public'], [oldPrivateId, privateKey, 'private'], [uuid, `images/${uuid}.png`, 'public']].map(([id, key, visibility]) =>
        db.prepare("INSERT INTO media (id,object_key,mime_type,size,original_filename,status,visibility) VALUES (?,?,'image/png',1,'image.png','ready',?)").bind(id, key, visibility)),
      db.prepare("INSERT INTO posts (id,slug,title,work_date,content_html,cover_asset_key,status,is_listed,version,revision_id) VALUES ('legacy-post','기존 주소','기존 작품','2025',?,?,'published',0,3,'original-revision')").bind(body, publicKey),
      db.prepare("UPDATE pages SET content_html=?,version=2 WHERE slug='memo'").bind(memoBody),
      db.prepare("INSERT INTO media_references VALUES (?,'post','legacy-post')").bind(oldPublicId),
      db.prepare("INSERT INTO media_references VALUES (?,'page','memo')").bind(oldPrivateId),
    ]);
    await applyMigration(db, '0002_media_relationships.sql');
    const publicMedia = await db.prepare('SELECT * FROM media WHERE object_key=?').bind(publicKey).first<{ id: string; visibility: string }>();
    const privateMedia = await db.prepare('SELECT * FROM media WHERE object_key=?').bind(privateKey).first<{ id: string; visibility: string }>();
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    expect(publicMedia!.id).toMatch(uuidPattern);
    expect(privateMedia!.id).toMatch(uuidPattern);
    expect(privateMedia!.visibility).toBe('private');
    expect(await db.prepare('SELECT id FROM media WHERE id=?').bind(uuid).first()).toEqual({ id: uuid });
    const post = await db.prepare("SELECT * FROM posts WHERE id='legacy-post'").first();
    expect(post).toMatchObject({ cover_media_id: publicMedia!.id, slug: '기존 주소', content_html: body, version: 3, revision_id: 'original-revision', is_listed: 0 });
    expect(post).not.toHaveProperty('cover_asset_key');
    expect(await db.prepare("SELECT content_html,version,visibility FROM pages WHERE slug='memo'").first()).toEqual({ content_html: memoBody, version: 2, visibility: 'private' });
    expect(await db.prepare("SELECT media_id FROM post_media WHERE post_id='legacy-post'").first()).toEqual({ media_id: publicMedia!.id });
    expect(await db.prepare("SELECT media_id FROM page_media WHERE page_slug='memo'").first()).toEqual({ media_id: privateMedia!.id });
    expect(await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='media_references'").first()).toBeNull();
    expect((await db.prepare('PRAGMA foreign_key_check').all()).results).toEqual([]);
    await expect(db.prepare('DELETE FROM media WHERE id=?').bind(privateMedia!.id).run()).rejects.toThrow();
    const changedId = 'b310c6f8-c704-4ed6-839f-6c2d6215808e';
    await db.prepare('UPDATE media SET id=? WHERE id=?').bind(changedId, publicMedia!.id).run();
    expect(await db.prepare("SELECT cover_media_id FROM posts WHERE id='legacy-post'").first()).toEqual({ cover_media_id: changedId });
    expect(await db.prepare("SELECT media_id FROM post_media WHERE post_id='legacy-post'").first()).toEqual({ media_id: changedId });
    await db.prepare("DELETE FROM posts WHERE id='legacy-post'").run();
    expect((await db.prepare('SELECT * FROM post_media').all()).results).toEqual([]);
    expect(await db.prepare('SELECT id FROM media WHERE id=?').bind(changedId).first()).toEqual({ id: changedId });
  });
});

describe('administrator boundary', () => {
  it('never enables the development bypass in production or on a public hostname', async () => {
    const settings = { ...env, ACCESS_TEAM_DOMAIN: 'example.cloudflareaccess.com', ACCESS_AUD: 'test-audience' };
    for (const config of [
      { env: { ...settings, ENVIRONMENT: 'production' } },
      { env: settings, host: 'https://www.duldoljimi.com' },
    ]) {
      const result = await request('/api/admin/session', 'GET', undefined, config);
      expect(result.status).toBe(401);
      expect(await responseJson(result)).toMatchObject({ authenticated: false, login_url: '/api/admin/login?return_to=%2FEditor' });
    }
  });

  it('rejects missing and foreign mutation origins', async () => {
    for (const requestOrigin of [null, 'https://other.example']) {
      const result = await request('/api/admin/posts', 'POST', { title: 'Rejected', work_date: '2026' }, { origin: requestOrigin });
      expect(result.status).toBe(403);
    }
    expect((await responseJson(await request('/api/admin/posts'))).posts).toHaveLength(0);
  });

  it('checks the JWT signature, issuer, audience, and expiration', async () => {
    const { privateKey, publicKey } = await generateKeyPair('RS256', { extractable: true });
    const keys = createLocalJWKSet({ keys: [{ ...await exportJWK(publicKey), kid: 'test' }] });
    const issuer = 'https://example.cloudflareaccess.com';
    const token = (audience = 'admin', tokenIssuer = issuer, expires = '2m') => new SignJWT({ email: 'admin@example.com' }).setProtectedHeader({ alg: 'RS256', kid: 'test' }).setSubject('admin-id').setIssuer(tokenIssuer).setAudience(audience).setExpirationTime(expires).sign(privateKey);
    expect(await verifyAccessJwt(await token(), issuer, 'admin', keys)).toEqual({ subject: 'admin-id', email: 'admin@example.com' });
    await expect(verifyAccessJwt(await token('other'), issuer, 'admin', keys)).rejects.toThrow();
    await expect(verifyAccessJwt(await token('admin', 'https://other.cloudflareaccess.com'), issuer, 'admin', keys)).rejects.toThrow();
    await expect(verifyAccessJwt(await token('admin', issuer, '-1s'), issuer, 'admin', keys)).rejects.toThrow();
    const valid = await token();
    const parts = valid.split('.');
    parts[2] = `${parts[2][0] === 'A' ? 'B' : 'A'}${parts[2].slice(1)}`;
    await expect(verifyAccessJwt(parts.join('.'), issuer, 'admin', keys)).rejects.toThrow();
  });
});

describe('content lifecycle', () => {
  it('publishes immediately, preserves slug URLs, and keeps drafts out of public queries', async () => {
    const created = await request('/api/admin/posts', 'POST', { title: '작품', slug: '오래된 작품 이름', work_date: '2026-11-11', status: 'published', content_html: '<p>Hello</p>', featured_order: 0 });
    expect(created.status).toBe(201);
    const { post } = await responseJson(created);
    await request('/api/admin/posts', 'POST', { title: 'Draft', work_date: '2025' });
    const listed = (await responseJson(await request('/api/posts'))).posts;
    expect(listed).toHaveLength(1);
    expect(listed[0]).toMatchObject({ id: post.id, slug: '오래된 작품 이름', year: '2026-11-11', content_html: '<p>Hello</p>' });
    expect((await responseJson(await request(`/api/posts/${encodeURIComponent(post.slug)}`))).post.id).toBe(post.id);
    expect((await responseJson(await request('/api/posts?featured=1'))).posts).toHaveLength(1);
  });

  it('rejects a stale edit instead of overwriting a newer saved document', async () => {
    const { post } = await responseJson(await request('/api/admin/posts', 'POST', { title: 'First', work_date: '2026' }));
    const updated = await request(`/api/admin/posts/${post.id}`, 'PUT', { title: 'Newer', version: 1 });
    expect(updated.status).toBe(200);
    expect((await responseJson(updated)).post.version).toBe(2);
    const stale = await request(`/api/admin/posts/${post.id}`, 'PUT', { title: 'Stale', version: 1 });
    expect(stale.status).toBe(409);
    expect((await responseJson(await request(`/api/admin/posts/${post.id}`))).post.title).toBe('Newer');
  });

  it('requires the existing version for updates and rejects duplicate slugs', async () => {
    const { post } = await responseJson(await request('/api/admin/posts', 'POST', { title: 'One', slug: 'same', work_date: '2026' }));
    expect((await request(`/api/admin/posts/${post.id}`, 'PUT', { title: 'Missing version' })).status).toBe(400);
    expect((await request('/api/admin/posts', 'POST', { title: 'Two', slug: 'same', work_date: '2026' })).status).toBe(409);
  });

  it('always keeps memo private and removes executable HTML on save', async () => {
    const saved = await request('/api/admin/pages/memo', 'PUT', { version: 1, visibility: 'public', content_html: '<p>Private</p><script>alert(1)</script><img src="https://example.com/a.png" onerror="alert(1)">' });
    expect(saved.status).toBe(200);
    const { page } = await responseJson(saved);
    expect(page.visibility).toBe('private');
    expect(page.content_html).not.toMatch(/script|onerror/);
    expect((await request('/api/pages/memo')).status).toBe(401);
    expect((await responseJson(await request('/api/admin/pages/memo'))).page.content_html).toContain('Private');
  });
});

describe('R2 media lifecycle', () => {
  it('publishes only finalized objects and rejects false file types', async () => {
    const issued = await responseJson(await request('/api/admin/assets', 'POST', { filename: 'image.png', content_type: 'image/png', size: png.length }));
    expect((await request(issued.asset.url)).status).toBe(404);
    expect((await request(issued.finalize_url, 'POST')).status).toBe(409);
    const fake = new Uint8Array(png.length);
    expect((await request(issued.upload.url, 'PUT', fake, { headers: issued.upload.headers })).status).toBe(400);
    expect((await request(issued.upload.url, 'PUT', png, { headers: issued.upload.headers })).status).toBe(200);
    const finalized = await responseJson(await request(issued.finalize_url, 'POST'));
    expect(finalized.asset.status).toBe('ready');
    const image = await request(finalized.asset.url);
    expect(image.status).toBe(200);
    expect(image.headers.get('content-type')).toBe('image/png');
    expect(new Uint8Array(await image.arrayBuffer())).toEqual(png);
    expect((await request(issued.upload.url, 'PUT', png, { headers: issued.upload.headers })).status).toBe(409);
  });

  it('checks direct uploads again during finalization', async () => {
    const issued = await responseJson(await request('/api/admin/assets', 'POST', { filename: 'image.png', content_type: 'image/png', size: png.length }));
    const row = await env.DB.prepare('SELECT upload_key FROM media WHERE id=?').bind(issued.asset.id).first<{ upload_key: string }>();
    await env.MEDIA.put(row!.upload_key, new Uint8Array(png.length), { httpMetadata: { contentType: 'image/png' } });
    expect((await request(issued.finalize_url, 'POST')).status).toBe(400);
    expect((await request(issued.asset.url)).status).toBe(404);
  });

  it('presigns only a staging key with a five minute expiry and content type', async () => {
    const issued = await issueAsset(new Request('https://www.duldoljimi.com/api/admin/assets'), { ...env, ENVIRONMENT: 'production', R2_ACCOUNT_ID: 'test-account', R2_BUCKET_NAME: 'test-bucket', R2_ACCESS_KEY_ID: 'test-key', R2_SECRET_ACCESS_KEY: 'test-secret' }, { filename: 'image.png', content_type: 'image/png', size: png.length });
    const url = new URL(issued.upload.url);
    expect(url.hostname).toBe('test-account.r2.cloudflarestorage.com');
    expect(url.pathname).toContain('/test-bucket/staging/');
    expect(url.searchParams.get('X-Amz-Expires')).toBe('300');
    expect(url.searchParams.get('X-Amz-SignedHeaders')).toContain('content-type');
    expect(issued.asset.object_key).toMatch(/^images\//);
  });

  it('rejects SVG and files over 20MB', async () => {
    expect((await request('/api/admin/assets', 'POST', { filename: 'x.svg', content_type: 'image/svg+xml', size: 100 })).status).toBe(415);
    expect((await request('/api/admin/assets', 'POST', { filename: 'x.png', content_type: 'image/png', size: MAX_ASSET_BYTES + 1 })).status).toBe(413);
  });

  it('protects private memo files from public URLs and public post references', async () => {
    const asset = await upload('private');
    expect(asset.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(asset.object_key).toBe(`images/${asset.id}.png`);
    expect(asset.url).toMatch(/^\/api\/admin\/media\//);
    expect((await request(asset.url)).status).toBe(200);
    expect((await request(`/api/media/${asset.object_key}`)).status).toBe(404);
    const denied = await request(asset.url, 'GET', undefined, { env: { ...env, ENVIRONMENT: 'production', ACCESS_TEAM_DOMAIN: 'example.cloudflareaccess.com', ACCESS_AUD: 'admin' } });
    expect(denied.status).toBe(401);
    expect((await request('/api/admin/posts', 'POST', { title: 'Invalid', work_date: '2026', content_html: `<img src="${asset.url}">` })).status).toBe(400);
    expect((await request('/api/admin/pages/memo', 'PUT', { version: 1, content_html: `<img src="${asset.url}">` })).status).toBe(200);
    expect((await request(`/api/admin/assets/${asset.id}`, 'DELETE')).status).toBe(409);
  });

  it('keeps references consistent after a stale edit and permits safe cleanup', async () => {
    const a = await upload();
    const b = await upload();
    const { post } = await responseJson(await request('/api/admin/posts', 'POST', { title: 'Images', work_date: '2026', status: 'published', cover_media_id: a.id, cover_url: a.url, content_html: `<img src="${a.url}">` }));
    expect(post).toMatchObject({ cover_media_id: a.id, titleimg: a.url });
    expect((await responseJson(await request('/api/posts'))).posts[0].titleimg).toBe(a.url);
    const saved = await request(`/api/admin/posts/${post.id}`, 'PUT', { version: 1, cover_media_id: b.id, cover_url: b.url, content_html: `<img src="${b.url}">` });
    expect(saved.status).toBe(200);
    expect((await responseJson(saved)).post).toMatchObject({ cover_media_id: b.id, titleimg: b.url });
    expect(await env.DB.prepare('SELECT cover_url FROM posts WHERE id=?').bind(post.id).first()).toEqual({ cover_url: null });
    expect((await responseJson(await request('/api/posts'))).posts[0].titleimg).toBe(b.url);
    expect((await request(`/api/admin/posts/${post.id}`, 'PUT', { version: 1, content_html: `<img src="${a.url}">` })).status).toBe(409);
    expect((await request(`/api/admin/assets/${b.id}`, 'DELETE')).status).toBe(409);
    expect((await request(`/api/admin/assets/${a.id}`, 'DELETE')).status).toBe(200);
    expect((await request(`/api/admin/posts/${post.id}`, 'DELETE', { version: 1 })).status).toBe(409);
    expect((await request(`/api/admin/posts/${post.id}?version=1`, 'DELETE')).status).toBe(409);
    expect((await request(`/api/admin/posts/${post.id}`, 'DELETE', { version: 2 })).status).toBe(200);
    expect((await request(`/api/admin/assets/${b.id}`, 'DELETE')).status).toBe(200);
  });
});
