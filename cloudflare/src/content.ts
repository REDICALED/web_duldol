import sanitizeHtml from 'sanitize-html';
import { ApiError, requireVersion, textField } from './http';
import type { Env, MediaRow, PageRow, PostRow } from './types';

export function cleanHtml(value: unknown): string {
  return sanitizeHtml(textField(value, 'content_html', 1_500_000, true), {
    allowedTags: ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 's', 'u', 'code', 'pre', 'hr', 'span', 'a', 'img', 'iframe', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'div', 'sup', 'sub'],
    allowedAttributes: { '*': ['style', 'class'], a: ['href', 'target', 'rel'], img: ['src', 'alt', 'width', 'height', 'title'], iframe: ['src', 'width', 'height', 'allowfullscreen', 'title'], td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan'] },
    allowedSchemes: ['https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['https'] },
    allowProtocolRelative: false,
    allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
    allowedStyles: { '*': { 'text-align': [/^(left|right|center|justify)$/], color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\([\d\s,.%]+\)$/, /^[a-zA-Z]+$/], 'background-color': [/^#[0-9a-fA-F]{3,8}$/], 'font-size': [/^\d+(?:px|em|rem|pt|%)$/] } },
    transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }) },
  });
}

export function mediaUrl(media: Pick<MediaRow, 'object_key' | 'visibility'>): string {
  return `${media.visibility === 'private' ? '/api/admin/media/' : '/api/media/'}${media.object_key}`;
}

export function presentPost(row: PostRow) {
  const cover = row.cover_asset_key ? `/api/media/${row.cover_asset_key}` : row.cover_url || '';
  const { revision_id: _revision, ...post } = row;
  return { ...post, year: row.work_date, hashdate: /^\d+$/.test(row.id) ? Number(row.id) : 0, titleimg: cover, cover_url: cover };
}

export function presentPage(row: PageRow) {
  const { revision_id: _revision, ...page } = row;
  return page;
}

export async function findPost(env: Env, key: string, publicOnly = false): Promise<PostRow> {
  const row = await env.DB.prepare(`SELECT * FROM posts WHERE (id = ? OR slug = ?) ${publicOnly ? "AND status = 'published'" : ''} ORDER BY CASE WHEN id = ? THEN 0 ELSE 1 END LIMIT 1`).bind(key, key, key).first<PostRow>();
  if (!row) throw new ApiError(404, 'not_found', '게시물을 찾을 수 없습니다.');
  return row;
}

export async function findPage(env: Env, slug: string): Promise<PageRow> {
  const page = await env.DB.prepare('SELECT * FROM pages WHERE slug = ?').bind(slug).first<PageRow>();
  if (!page) throw new ApiError(404, 'not_found', '페이지를 찾을 수 없습니다.');
  return page;
}

function optionalInteger(value: unknown, fallback: number | null): number | null {
  if (value === undefined) return fallback;
  if (value === null) return null;
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || Math.abs(value) > 2_147_483_647) throw new ApiError(400, 'invalid_field', '정수 순서 값이 필요합니다.');
  return value;
}

function coverUrl(value: unknown): string | null {
  if (value === null || value === '') return null;
  const url = textField(value, 'cover_url', 2000);
  if (/^\/(?:api\/)?media\/[a-zA-Z0-9/_%.-]+$/.test(url)) return url;
  try { if (new URL(url).protocol === 'https:') return url; } catch { /* Invalid URL. */ }
  throw new ApiError(400, 'invalid_cover', '커버는 업로드된 미디어 또는 HTTPS 이미지여야 합니다.');
}

function postValues(body: Record<string, unknown>, previous?: PostRow) {
  const id = previous?.id || crypto.randomUUID();
  const title = textField(body.title ?? previous?.title, 'title');
  const workDate = textField(body.work_date ?? body.year ?? previous?.work_date, 'work_date', 10);
  if (!/^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/.test(workDate) || (workDate.length === 10 && (Number.isNaN(Date.parse(workDate)) || new Date(workDate).toISOString().slice(0, 10) !== workDate))) throw new ApiError(400, 'invalid_date', '연도 또는 YYYY-MM-DD 날짜가 필요합니다.');
  const slug = textField(body.slug ?? previous?.slug ?? id, 'slug', 300);
  if (/[\/?#\u0000-\u001f]/.test(slug) || slug === '.' || slug === '..') throw new ApiError(400, 'invalid_slug', 'slug에 경로 구분자를 사용할 수 없습니다.');
  const html = body.content_html === undefined ? previous?.content_html || '' : cleanHtml(body.content_html);
  const assetKey = body.cover_asset_key === undefined ? previous?.cover_asset_key || null : body.cover_asset_key === null || body.cover_asset_key === '' ? null : textField(body.cover_asset_key, 'cover_asset_key', 500);
  const url = body.cover_url === undefined && body.titleimg === undefined ? previous?.cover_url || null : coverUrl(body.cover_url ?? body.titleimg);
  const status = body.status ?? previous?.status ?? 'draft';
  if (!['draft', 'published', 'archived'].includes(String(status))) throw new ApiError(400, 'invalid_status', '게시 상태가 올바르지 않습니다.');
  const listed = body.is_listed ?? previous?.is_listed ?? 1;
  if (![true, false, 0, 1].includes(listed as boolean | number)) throw new ApiError(400, 'invalid_field', 'is_listed 값이 올바르지 않습니다.');
  return { id, slug, title, work_date: workDate, content_html: html, cover_asset_key: assetKey, cover_url: url, status: String(status), is_listed: listed ? 1 : 0, sort_order: optionalInteger(body.sort_order, previous?.sort_order ?? 0) ?? 0, featured_order: optionalInteger(body.featured_order, previous?.featured_order ?? null) };
}

export async function referencedMedia(env: Env, html: string, cover: string | null, coverLink: string | null, ownerVisibility: 'public' | 'private'): Promise<MediaRow[]> {
  const keys = new Set<string>();
  if (cover) keys.add(cover);
  const text = `${html} ${coverLink || ''}`;
  const pattern = /\/(?:api\/(?:admin\/)?)?media\/([a-zA-Z0-9/_%.-]+)/g;
  for (const match of text.matchAll(pattern)) {
    try { keys.add(decodeURIComponent(match[1])); } catch { throw new ApiError(400, 'invalid_asset', '미디어 경로가 올바르지 않습니다.'); }
  }
  if (keys.size > 200) throw new ApiError(400, 'too_many_assets', '문서당 최대 200개의 미디어를 사용할 수 있습니다.');
  const assets: MediaRow[] = [];
  for (const key of keys) {
    const media = await env.DB.prepare("SELECT * FROM media WHERE object_key = ? AND status = 'ready'").bind(key).first<MediaRow>();
    if (!media) throw new ApiError(400, 'asset_not_ready', '업로드 완료되지 않은 미디어가 포함되어 있습니다.');
    if (ownerVisibility === 'public' && media.visibility === 'private') throw new ApiError(400, 'private_asset', '비공개 미디어를 공개 문서에 사용할 수 없습니다.');
    assets.push(media);
  }
  return assets;
}

function referenceStatements(env: Env, ownerType: 'post' | 'page', ownerId: string, revision: string, media: MediaRow[]) {
  const table = ownerType === 'post' ? 'posts' : 'pages';
  const key = ownerType === 'post' ? 'id' : 'slug';
  // The unique revision guard keeps stale edits from changing references, even
  // when their optimistic UPDATE affected no rows. D1 batch is one transaction.
  return [
    env.DB.prepare(`DELETE FROM media_references WHERE owner_type = ? AND owner_id = ? AND EXISTS (SELECT 1 FROM ${table} WHERE ${key} = ? AND revision_id = ?)`).bind(ownerType, ownerId, ownerId, revision),
    ...media.map(asset => env.DB.prepare(`INSERT INTO media_references (media_id, owner_type, owner_id) SELECT ?, ?, ? WHERE EXISTS (SELECT 1 FROM ${table} WHERE ${key} = ? AND revision_id = ?)`).bind(asset.id, ownerType, ownerId, ownerId, revision)),
  ];
}

export async function savePost(env: Env, body: Record<string, unknown>, previous?: PostRow) {
  const values = postValues(body, previous);
  const media = await referencedMedia(env, values.content_html, values.cover_asset_key, values.cover_url, 'public');
  const revision = crypto.randomUUID();
  const now = new Date().toISOString();
  const params = [values.slug, values.title, values.work_date, values.content_html, values.cover_asset_key, values.cover_url, values.status, values.is_listed, values.sort_order, values.featured_order, revision, now];
  let statement: D1PreparedStatement;
  if (previous) {
    const version = requireVersion(body.version);
    statement = env.DB.prepare('UPDATE posts SET slug=?,title=?,work_date=?,content_html=?,cover_asset_key=?,cover_url=?,status=?,is_listed=?,sort_order=?,featured_order=?,revision_id=?,updated_at=?,version=version+1 WHERE id=? AND version=?').bind(...params, previous.id, version);
  } else {
    statement = env.DB.prepare('INSERT INTO posts (slug,title,work_date,content_html,cover_asset_key,cover_url,status,is_listed,sort_order,featured_order,revision_id,updated_at,id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(...params, values.id, now);
  }
  try {
    const result = await env.DB.batch([statement, ...referenceStatements(env, 'post', values.id, revision, media)]);
    if (!result[0].meta.changes) throw new ApiError(409, 'version_conflict', '다른 곳에서 수정된 글입니다. 새로 불러온 뒤 다시 저장해주세요.');
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (String(error).includes('UNIQUE constraint')) throw new ApiError(409, 'duplicate_slug', '이미 사용 중인 주소입니다.');
    throw error;
  }
  return presentPost(await findPost(env, values.id));
}

export async function savePage(env: Env, slug: string, body: Record<string, unknown>) {
  const previous = await findPage(env, slug);
  const version = requireVersion(body.version);
  const title = textField(body.title ?? previous.title, 'title', 300, true);
  const html = body.content_html === undefined ? previous.content_html : cleanHtml(body.content_html);
  const visibility = slug === 'memo' ? 'private' : body.visibility ?? previous.visibility;
  if (visibility !== 'public' && visibility !== 'private') throw new ApiError(400, 'invalid_visibility', '공개 상태가 올바르지 않습니다.');
  const media = await referencedMedia(env, html, null, null, visibility);
  const revision = crypto.randomUUID();
  const result = await env.DB.batch([
    env.DB.prepare('UPDATE pages SET title=?,content_html=?,visibility=?,revision_id=?,updated_at=?,version=version+1 WHERE slug=? AND version=?').bind(title, html, visibility, revision, new Date().toISOString(), slug, version),
    ...referenceStatements(env, 'page', slug, revision, media),
  ]);
  if (!result[0].meta.changes) throw new ApiError(409, 'version_conflict', '다른 곳에서 수정된 페이지입니다. 새로 불러온 뒤 다시 저장해주세요.');
  return presentPage(await findPage(env, slug));
}

export async function removePost(env: Env, post: PostRow, version: number) {
  const result = await env.DB.batch([
    env.DB.prepare("DELETE FROM media_references WHERE owner_type = 'post' AND owner_id = ? AND EXISTS (SELECT 1 FROM posts WHERE id = ? AND version = ?)").bind(post.id, post.id, version),
    env.DB.prepare('DELETE FROM posts WHERE id = ? AND version = ?').bind(post.id, version),
  ]);
  if (!result[1].meta.changes) throw new ApiError(409, 'version_conflict', '다른 곳에서 수정된 글입니다. 새로 불러온 뒤 다시 삭제해주세요.');
  // Media is retained until explicitly deleted when no document references it.
}
