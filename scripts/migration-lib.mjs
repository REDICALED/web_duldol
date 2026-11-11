import { createHash, randomUUID } from 'node:crypto';

export const UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export const MEDIA_KEY_PATTERN = /^images\/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\.[a-z]+$/i;

export function mediaIdentityKey(sourceIdentity, visibility) {
  return JSON.stringify([visibility, sourceIdentity]);
}

export function getMediaIdentity(identities, sourceIdentity, visibility, createId = randomUUID) {
  const key = mediaIdentityKey(sourceIdentity, visibility);
  if (!UUID_PATTERN.test(identities[key] || '')) identities[key] = createId();
  if (!UUID_PATTERN.test(identities[key])) throw new Error('Media identity must be a UUID');
  return identities[key];
}

export const LEGACY_POSTS = [
  '감정의 정반합', '단단한 여자애의 소망', '돌계란(stonegg)', '모양들(shapes)',
  '미뢔(MIRWAE)', '신원계 新圓界 - 파고착조 破觚斲雕_', '여린 것들의 슬픔',
  '유하다', '중성인간(neutral person)', 'thinking about pebble', 'metamorphosis',
  'murmur-mural ensemble(웅얼웅얼-벽화 합창)',
];

export const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp',
  'image/avif': 'avif', 'image/svg+xml': 'svg', 'image/bmp': 'bmp',
};

export function hashBytes(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

export function decodeEntities(value) {
  return value.replace(/&#(x[\da-f]+|\d+);|&(amp|quot|apos|lt|gt);/gi, (_, numeric, named) => {
    if (numeric) return String.fromCodePoint(numeric[0].toLowerCase() === 'x'
      ? parseInt(numeric.slice(1), 16) : parseInt(numeric, 10));
    return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[named.toLowerCase()];
  });
}

export function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

export function parseDataImage(value) {
  const match = /^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/i.exec(value);
  if (!match || !MIME_EXTENSIONS[match[1].toLowerCase()]) throw new Error('Unsupported inline image');
  const encoded = match[2].replace(/\s/g, '');
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) {
    throw new Error('Invalid base64 image');
  }
  const bytes = Buffer.from(encoded, 'base64');
  if (!bytes.length) throw new Error('Empty inline image');
  return { mimeType: match[1].toLowerCase(), bytes };
}

async function replaceAsync(value, pattern, replace) {
  const matches = [...value.matchAll(pattern)];
  let output = '';
  let offset = 0;
  for (const match of matches) {
    output += value.slice(offset, match.index) + await replace(match);
    offset = match.index + match[0].length;
  }
  return output + value.slice(offset);
}

// Change only media URLs. Captions, text, image order and HTML styles are retained.
export async function rewriteMediaHtml(html, resolveUrl) {
  let result = await replaceAsync(html, /\b(src|poster)\s*=\s*(["'])(.*?)\2/gs, async match => {
    const original = decodeEntities(match[3]);
    const replacement = await resolveUrl(original);
    return replacement === original ? match[0] : `${match[1]}="${escapeAttribute(replacement)}"`;
  });
  result = await replaceAsync(result,
    /images=(?:&lt;){3}([\s\S]*?)(?:&gt;){3}|images=<<<([\s\S]*?)>>>/g,
    async match => {
      const encoded = match[1] !== undefined;
      const values = decodeEntities(match[1] ?? match[2]).split('#$%^');
      const urls = [];
      for (const value of values) urls.push(await resolveUrl(value.trim()));
      return encoded
        ? `images=&lt;&lt;&lt;${escapeAttribute(urls.join('#$%^'))}&gt;&gt;&gt;`
        : `images=<<<${urls.join('#$%^')}>>>`;
    });
  return result;
}

export function sqlLiteral(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Invalid SQL number');
    return String(value);
  }
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function insertSql(table, row, conflictKey, preserveEdits = false) {
  const columns = Object.keys(row);
  const assignments = columns.filter(column => column !== conflictKey)
    .map(column => `${column}=excluded.${column}`).join(',');
  return `INSERT INTO ${table} (${columns.join(',')}) VALUES (${columns.map(column => sqlLiteral(row[column])).join(',')})`
    + ` ON CONFLICT(${conflictKey}) DO UPDATE SET ${assignments}`
    + (preserveEdits ? ` WHERE ${table}.version=1` : '') + ';';
}

export function mediaLinksSql(ownerType, ownerId, mediaIds) {
  const post = ownerType === 'post';
  if (!post && ownerType !== 'page') throw new Error('Unknown media owner type');
  const table = post ? 'post_media' : 'page_media';
  const column = post ? 'post_id' : 'page_slug';
  const ownerTable = post ? 'posts' : 'pages';
  const ownerKey = post ? 'id' : 'slug';
  const eligible = `EXISTS (SELECT 1 FROM ${ownerTable} WHERE ${ownerKey}=${sqlLiteral(ownerId)} AND version=1)`;
  return [
    `DELETE FROM ${table} WHERE ${column}=${sqlLiteral(ownerId)} AND ${eligible};`,
    ...[...new Set(mediaIds)].map(id => `INSERT INTO ${table} (${column},media_id) SELECT ${sqlLiteral(ownerId)},${sqlLiteral(id)} WHERE ${eligible} ON CONFLICT(${column},media_id) DO NOTHING;`),
  ];
}

export function inspectHtml(html) {
  return {
    inlineImages: (html.match(/data:image\//g) || []).length,
    blobReferences: (html.match(/blob:/g) || []).length,
    sliders: (html.match(/\[슬라이더입니다!\]/g) || []).length,
    videos: (html.match(/\[비디오입니다!\]/g) || []).length,
  };
}
