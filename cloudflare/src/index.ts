import { localBypass, loginUrl, requireAdmin, requireMutationOrigin } from './auth';
import { findPage, findPost, presentPage, presentPost, removePost, savePage, savePost } from './content';
import { ApiError, json, jsonBody, requireVersion } from './http';
import { finalizeAsset, issueAsset, presentAsset, removeAsset, serveMedia, uploadLocalAsset } from './media';
import type { Env, MediaRow, PostRow } from './types';

function decodedPart(part: string): string {
  try { return decodeURIComponent(part); } catch { throw new ApiError(400, 'invalid_path', 'URL 경로가 올바르지 않습니다.'); }
}

async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '') || '/';
  const method = request.method;
  const publicMedia = path.match(/^\/(?:api\/)?media\/(.+)$/);
  if (publicMedia && ['GET', 'HEAD'].includes(method)) return serveMedia(request, env, decodedPart(publicMedia[1]));
  if (path === '/api/health' && method === 'GET') return json({ ok: true, service: 'duldol-content-api' });
  if (path === '/api/posts' && method === 'GET') {
    const featured = url.searchParams.get('featured') === '1';
    const result = await env.DB.prepare(`SELECT p.*,m.object_key AS cover_object_key FROM posts p LEFT JOIN media m ON m.id=p.cover_media_id WHERE p.status='published' ${featured ? 'AND p.featured_order IS NOT NULL' : 'AND p.is_listed=1'} ORDER BY ${featured ? 'p.featured_order ASC,' : ''} p.sort_order ASC,p.work_date DESC,p.id ASC`).all<PostRow>();
    return json({ posts: result.results.map(presentPost) });
  }
  const postRoute = path.match(/^\/api\/posts\/([^/]+)$/);
  if (postRoute && method === 'GET') return json({ post: presentPost(await findPost(env, decodedPart(postRoute[1]), true)) });
  const pageRoute = path.match(/^\/api\/pages\/([^/]+)$/);
  if (pageRoute && method === 'GET') {
    const page = await findPage(env, decodedPart(pageRoute[1]));
    if (page.visibility !== 'public' || page.slug === 'memo') throw new ApiError(401, 'private_page', '비공개 페이지입니다. 관리자 로그인이 필요합니다.');
    return json({ page: presentPage(page) });
  }
  if (path !== '/api/admin' && !path.startsWith('/api/admin/')) throw new ApiError(404, 'not_found', 'API 경로를 찾을 수 없습니다.');
  const identity = await requireAdmin(request, env);
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) requireMutationOrigin(request, env);
  if (path === '/api/admin/login' && method === 'GET') {
    const returnTo = url.searchParams.get('return_to') || '/Editor';
    const safeTarget = returnTo.startsWith('/') && !returnTo.startsWith('//') && !returnTo.includes('\\') && !/[\u0000-\u0020\u007f]/.test(returnTo) ? returnTo : '/Editor';
    return new Response(null, { status: 302, headers: { Location: safeTarget, 'Cache-Control': 'no-store' } });
  }
  if (path === '/api/admin/session' && method === 'GET') return json({ authenticated: true, ...identity, development: localBypass(request, env) });
  if (path === '/api/admin/posts') {
    if (method === 'GET') {
      const result = await env.DB.prepare('SELECT p.*,m.object_key AS cover_object_key FROM posts p LEFT JOIN media m ON m.id=p.cover_media_id ORDER BY p.sort_order ASC,p.work_date DESC,p.id ASC').all<PostRow>();
      return json({ posts: result.results.map(presentPost) });
    }
    if (method === 'POST') return json({ post: await savePost(env, await jsonBody(request)) }, 201);
  }
  const adminPost = path.match(/^\/api\/admin\/posts\/([^/]+)$/);
  if (adminPost) {
    const post = await findPost(env, decodedPart(adminPost[1]));
    if (method === 'GET') return json({ post: presentPost(post) });
    if (method === 'PUT') return json({ post: await savePost(env, await jsonBody(request), post) });
    if (method === 'DELETE') {
      const version = url.searchParams.has('version') ? requireVersion(Number(url.searchParams.get('version'))) : requireVersion((await jsonBody(request)).version);
      await removePost(env, post, version);
      return json({ deleted: true, id: post.id });
    }
  }
  const adminPage = path.match(/^\/api\/admin\/pages\/([^/]+)$/);
  if (adminPage) {
    const slug = decodedPart(adminPage[1]);
    if (method === 'GET') return json({ page: presentPage(await findPage(env, slug)) });
    if (method === 'PUT') return json({ page: await savePage(env, slug, await jsonBody(request)) });
  }
  if (path === '/api/admin/assets') {
    if (method === 'POST') return json(await issueAsset(request, env, await jsonBody(request)), 201);
    if (method === 'GET') {
      const result = await env.DB.prepare('SELECT * FROM media ORDER BY created_at DESC LIMIT 200').all<MediaRow>();
      return json({ assets: result.results.map(presentAsset) });
    }
  }
  const assetAction = path.match(/^\/api\/admin\/assets\/([^/]+)\/(content|finalize)$/);
  if (assetAction) {
    const id = decodedPart(assetAction[1]);
    if (assetAction[2] === 'content' && method === 'PUT') { await uploadLocalAsset(request, env, id); return json({ uploaded: true }); }
    if (assetAction[2] === 'finalize' && method === 'POST') return json({ asset: await finalizeAsset(env, id) });
  }
  const assetRoute = path.match(/^\/api\/admin\/assets\/([^/]+)$/);
  if (assetRoute && method === 'DELETE') { await removeAsset(env, decodedPart(assetRoute[1])); return json({ deleted: true }); }
  const privateMedia = path.match(/^\/api\/admin\/media\/(.+)$/);
  if (privateMedia && ['GET', 'HEAD'].includes(method)) return serveMedia(request, env, decodedPart(privateMedia[1]), true);
  throw new ApiError(404, 'not_found', 'API 경로 또는 요청 방식을 찾을 수 없습니다.');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try { return await handle(request, env); }
    catch (error) {
      const failure = error instanceof ApiError ? error : new ApiError(500, 'internal_error', '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      if (!(error instanceof ApiError)) console.error('Content API internal error', localBypass(request, env) ? error : { type: error instanceof Error ? error.name : 'unknown' });
      const session = new URL(request.url).pathname === '/api/admin/session';
      return json({ error: { code: failure.code, message: failure.message }, ...(session ? { authenticated: false, login_url: loginUrl() } : {}) }, failure.status);
    }
  },
};
