import { AwsClient } from 'aws4fetch';
import { localBypass } from './auth';
import { mediaUrl } from './content';
import { ApiError, readLimitedBody, textField } from './http';
import type { Env, MediaRow } from './types';

export const MAX_ASSET_BYTES = 20 * 1024 * 1024;
const formats: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/avif': 'avif', 'application/pdf': 'pdf' };

export function presentAsset(row: MediaRow) {
  const { upload_key: _uploadKey, ...asset } = row;
  return { ...asset, url: mediaUrl(row) };
}

export async function findAsset(env: Env, id: string): Promise<MediaRow> {
  const row = await env.DB.prepare('SELECT * FROM media WHERE id = ?').bind(id).first<MediaRow>();
  if (!row) throw new ApiError(404, 'not_found', '미디어를 찾을 수 없습니다.');
  return row;
}

export function matchesFileSignature(type: string, bytes: Uint8Array): boolean {
  const prefix = String.fromCharCode(...bytes.slice(0, 32));
  switch (type) {
    case 'image/jpeg': return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case 'image/png': return bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value);
    case 'image/gif': return prefix.startsWith('GIF87a') || prefix.startsWith('GIF89a');
    case 'image/webp': return prefix.startsWith('RIFF') && prefix.slice(8, 12) === 'WEBP';
    case 'image/avif': return prefix.slice(4, 8) === 'ftyp' && ['avif', 'avis'].includes(prefix.slice(8, 12));
    case 'application/pdf': return prefix.startsWith('%PDF-');
    default: return false;
  }
}

export async function issueAsset(request: Request, env: Env, body: Record<string, unknown>) {
  const filename = textField(body.filename, 'filename', 500);
  const type = textField(body.content_type ?? body.mime_type, 'content_type', 100);
  const extension = formats[type];
  if (!extension) throw new ApiError(415, 'unsupported_file', 'JPEG, PNG, GIF, WebP, AVIF, PDF 파일을 업로드할 수 있습니다.');
  if (typeof body.size !== 'number' || !Number.isSafeInteger(body.size) || body.size < 1 || body.size > MAX_ASSET_BYTES) throw new ApiError(413, 'too_large', '파일은 20MB 이하여야 합니다.');
  const visibility = body.visibility ?? 'public';
  if (visibility !== 'public' && visibility !== 'private') throw new ApiError(400, 'invalid_visibility', '공개 상태가 올바르지 않습니다.');
  const id = crypto.randomUUID();
  const objectKey = `images/${id}.${extension}`;
  const uploadKey = `staging/${id}.${extension}`;
  let uploadUrl: string;
  if (localBypass(request, env)) {
    uploadUrl = `/api/admin/assets/${id}/content`;
  } else {
    if (!env.R2_ACCOUNT_ID || !env.R2_BUCKET_NAME || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) throw new ApiError(503, 'storage_not_configured', 'R2 직접 업로드 설정이 필요합니다.');
    const client = new AwsClient({ accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY, region: 'auto', service: 's3' });
    const url = new URL(`https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${uploadKey}`);
    url.searchParams.set('X-Amz-Expires', '300');
    const signed = await client.sign(url.toString(), { method: 'PUT', headers: { 'Content-Type': type }, aws: { signQuery: true, allHeaders: true } });
    uploadUrl = signed.url;
  }
  await env.DB.prepare('INSERT INTO media (id,object_key,upload_key,mime_type,size,original_filename,visibility) VALUES (?,?,?,?,?,?,?)').bind(id, objectKey, uploadKey, type, body.size, filename, visibility).run();
  return { asset: presentAsset(await findAsset(env, id)), upload: { url: uploadUrl, method: 'PUT', headers: { 'Content-Type': type }, expires_in: 300 }, finalize_url: `/api/admin/assets/${id}/finalize` };
}

export async function uploadLocalAsset(request: Request, env: Env, id: string) {
  if (!localBypass(request, env)) throw new ApiError(404, 'not_found', '직접 업로드 주소를 사용해주세요.');
  const asset = await findAsset(env, id);
  if (asset.status !== 'pending' || !asset.upload_key) throw new ApiError(409, 'asset_finalized', '이미 완료된 미디어입니다.');
  if (request.headers.get('content-type')?.split(';')[0] !== asset.mime_type) throw new ApiError(415, 'mime_mismatch', '선택한 파일 형식과 업로드 형식이 다릅니다.');
  const bytes = await readLimitedBody(request, MAX_ASSET_BYTES);
  if (bytes.length !== asset.size || !matchesFileSignature(asset.mime_type, bytes)) throw new ApiError(400, 'invalid_file', '파일 크기 또는 실제 파일 형식이 올바르지 않습니다.');
  await env.MEDIA.put(asset.upload_key, bytes, { httpMetadata: { contentType: asset.mime_type } });
}

export async function finalizeAsset(env: Env, id: string) {
  let asset = await findAsset(env, id);
  if (asset.status === 'ready') return presentAsset(asset);
  if (!asset.upload_key) throw new ApiError(409, 'invalid_asset', '업로드 경로가 없습니다.');
  const head = await env.MEDIA.head(asset.upload_key);
  if (!head) throw new ApiError(409, 'upload_incomplete', '파일 업로드를 먼저 완료해주세요.');
  if (head.size !== asset.size || head.size > MAX_ASSET_BYTES || head.httpMetadata?.contentType !== asset.mime_type) {
    await env.MEDIA.delete(asset.upload_key);
    throw new ApiError(400, 'invalid_file', '업로드한 파일의 크기 또는 형식이 올바르지 않습니다.');
  }
  const signature = await env.MEDIA.get(asset.upload_key, { range: { offset: 0, length: Math.min(head.size, 32) }, onlyIf: { etagMatches: head.etag } });
  const signatureBody = (signature as R2ObjectBody | null)?.body;
  if (!signatureBody) throw new ApiError(409, 'upload_changed', '검증 중 업로드 파일이 변경되었습니다. 다시 완료해주세요.');
  if (!matchesFileSignature(asset.mime_type, new Uint8Array(await new Response(signatureBody).arrayBuffer()))) {
    await env.MEDIA.delete(asset.upload_key);
    throw new ApiError(400, 'invalid_file', '실제 파일 형식이 선택한 형식과 다릅니다.');
  }
  const existing = await env.MEDIA.head(asset.object_key);
  if (existing && (existing.customMetadata?.assetId !== id || existing.customMetadata?.sourceEtag !== head.etag)) throw new ApiError(409, 'asset_conflict', '미디어 완료 상태가 충돌했습니다.');
  if (!existing) {
    const object = await env.MEDIA.get(asset.upload_key, { onlyIf: { etagMatches: head.etag } });
    const objectBody = (object as R2ObjectBody | null)?.body;
    if (!objectBody) throw new ApiError(409, 'upload_changed', '검증 중 업로드 파일이 변경되었습니다. 다시 완료해주세요.');
    // Never expose the signed staging object: its URL remains reusable until
    // expiry. The final immutable key is only writable by this Worker.
    // The validated 20 MiB cap bounds this copy. Passing bytes also works with
    // local R2 bindings, where bridged streams lose their known-length marker.
    const bytes = await new Response(objectBody).arrayBuffer();
    if (bytes.byteLength !== head.size) throw new ApiError(409, 'upload_changed', '검증 중 업로드 파일이 변경되었습니다. 다시 완료해주세요.');
    await env.MEDIA.put(asset.object_key, bytes, { httpMetadata: { contentType: asset.mime_type, cacheControl: asset.visibility === 'public' ? 'public, max-age=31536000, immutable' : 'private, no-store' }, customMetadata: { assetId: id, sourceEtag: head.etag }, onlyIf: { etagDoesNotMatch: '*' } });
  }
  await env.DB.prepare("UPDATE media SET status='ready',updated_at=? WHERE id=? AND status='pending'").bind(new Date().toISOString(), id).run();
  asset = await findAsset(env, id);
  await env.MEDIA.delete(asset.upload_key!);
  return presentAsset(asset);
}

export async function serveMedia(request: Request, env: Env, key: string, privateAccess = false) {
  const asset = await env.DB.prepare("SELECT * FROM media WHERE object_key=? AND status='ready'").bind(key).first<MediaRow>();
  if (!asset || (asset.visibility === 'private' && !privateAccess)) throw new ApiError(404, 'not_found', '미디어를 찾을 수 없습니다.');
  let range: R2Range | undefined;
  const rangeHeader = request.headers.get('range');
  if (rangeHeader) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
    if (!match || (!match[1] && !match[2])) throw new ApiError(416, 'invalid_range', '파일 범위 요청이 올바르지 않습니다.');
    if (!match[1]) {
      const suffix = Number(match[2]);
      if (!Number.isSafeInteger(suffix) || suffix <= 0) throw new ApiError(416, 'invalid_range', '파일 범위 요청이 올바르지 않습니다.');
      range = { suffix: Math.min(suffix, asset.size) };
    } else {
      const offset = Number(match[1]);
      const end = match[2] ? Math.min(Number(match[2]), asset.size - 1) : asset.size - 1;
      if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(end) || offset < 0 || offset >= asset.size || end < offset) throw new ApiError(416, 'invalid_range', '파일 범위 요청이 올바르지 않습니다.');
      range = { offset, length: end - offset + 1 };
    }
  }
  const object = await env.MEDIA.get(key, range ? { range } : undefined);
  if (!object) throw new ApiError(404, 'not_found', '미디어 파일을 찾을 수 없습니다.');
  const headers = new Headers();
  headers.set('Content-Type', asset.mime_type);
  headers.set('ETag', object.httpEtag);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Cache-Control', asset.visibility === 'public' && !privateAccess ? 'public, max-age=31536000, immutable' : 'private, no-store');
  headers.set('Content-Security-Policy', "default-src 'none'; sandbox");
  headers.set('Accept-Ranges', 'bytes');
  if (asset.mime_type === 'application/pdf') headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(asset.original_filename)}`);
  if (request.headers.get('if-none-match') === object.httpEtag && asset.visibility === 'public') return new Response(null, { status: 304, headers });
  if (range && object.range && 'offset' in object.range && object.range.offset !== undefined && 'length' in object.range && object.range.length !== undefined) {
    headers.set('Content-Range', `bytes ${object.range.offset}-${object.range.offset + object.range.length - 1}/${object.size}`);
    headers.set('Content-Length', String(object.range.length));
    return new Response(request.method === 'HEAD' ? null : object.body, { status: 206, headers });
  }
  headers.set('Content-Length', String(object.size));
  return new Response(request.method === 'HEAD' ? null : object.body, { headers });
}

export async function removeAsset(env: Env, id: string) {
  const asset = await findAsset(env, id);
  // Check imported HTML as well as normalized references, so migration can be
  // resumed safely before its reference backfill is complete.
  const result = await env.DB.prepare(`DELETE FROM media WHERE id=? AND NOT EXISTS (SELECT 1 FROM media_references WHERE media_id=?) AND NOT EXISTS (SELECT 1 FROM posts WHERE cover_asset_key=? OR instr(content_html,?)>0 OR instr(coalesce(cover_url,''),?)>0) AND NOT EXISTS (SELECT 1 FROM pages WHERE instr(content_html,?)>0)`).bind(id, id, asset.object_key, asset.object_key, asset.object_key, asset.object_key).run();
  if (!result.meta.changes) throw new ApiError(409, 'asset_in_use', '문서에서 사용 중인 미디어는 삭제할 수 없습니다.');
  await env.MEDIA.delete([asset.object_key, ...(asset.upload_key ? [asset.upload_key] : [])]);
}
