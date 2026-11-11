export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

export async function jsonBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    throw new ApiError(415, 'content_type', 'JSON 요청이 필요합니다.');
  }
  const maxBytes = 2 * 1024 * 1024;
  const text = await readLimitedBody(request, maxBytes);
  try {
    const result: unknown = JSON.parse(new TextDecoder().decode(text));
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error();
    return result as Record<string, unknown>;
  } catch {
    throw new ApiError(400, 'invalid_json', '올바른 JSON 객체가 필요합니다.');
  }
}

export async function readLimitedBody(request: Request, maxBytes: number): Promise<Uint8Array> {
  if (Number(request.headers.get('content-length') || 0) > maxBytes) {
    throw new ApiError(413, 'too_large', '파일 또는 본문 크기 제한을 초과했습니다.');
  }
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    length += chunk.value.byteLength;
    if (length > maxBytes) {
      await reader.cancel();
      throw new ApiError(413, 'too_large', '파일 또는 본문 크기 제한을 초과했습니다.');
    }
    chunks.push(chunk.value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}

export function textField(value: unknown, field: string, max = 300, allowEmpty = false): string {
  if (typeof value !== 'string' || (!allowEmpty && !value.trim()) || value.length > max) {
    throw new ApiError(400, 'invalid_field', `${field} 값이 올바르지 않습니다.`);
  }
  return value;
}

export function requireVersion(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) {
    throw new ApiError(400, 'version_required', '수정하려는 문서의 version이 필요합니다.');
  }
  return value;
}
