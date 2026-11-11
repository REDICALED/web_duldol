import { apiRequest } from './content-api';

export interface StoredAsset {
  id: string;
  object_key: string;
  url: string;
  status: string;
}

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

/** Upload the file directly to object storage, then make it available to posts. */
export async function uploadImage(file: File, visibility: 'public' | 'private' = 'public'): Promise<StoredAsset> {
  if (!imageTypes.has(file.type)) throw new Error('JPG, PNG, WebP, GIF, AVIF 이미지를 선택해주세요.');
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) throw new Error('이미지는 20MB 이하로 올려주세요.');
  const issued = await apiRequest<{
    asset: StoredAsset;
    upload: { url: string; method: string; headers: Record<string, string> };
    finalize_url: string;
  }>('/admin/assets', { method: 'POST', json: { filename: file.name, content_type: file.type, size: file.size, visibility } });
  const response = await fetch(issued.upload.url, {
    method: issued.upload.method,
    headers: issued.upload.headers,
    body: file,
    credentials: new URL(issued.upload.url, window.location.origin).origin === window.location.origin ? 'include' : 'omit',
  });
  if (!response.ok) throw new Error(`이미지 전송에 실패했습니다. (${response.status})`);
  const { asset } = await apiRequest<{ asset: StoredAsset }>(issued.finalize_url, { method: 'POST' });
  return asset;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '요청을 완료하지 못했습니다. 다시 시도해주세요.';
}
