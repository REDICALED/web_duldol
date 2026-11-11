import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEGACY_POSTS, UUID_PATTERN, MEDIA_KEY_PATTERN, decodeEntities, hashBytes, getMediaIdentity,
  mediaIdentityKey, mediaLinksSql, insertSql, inspectHtml,
  parseDataImage, rewriteMediaHtml,
} from './migration-lib.mjs';

test('image attributes and encoded slider URLs migrate without changing captions or order', async () => {
  const html = '<p>본문 &amp; 글</p><img src="/images/한글 사진.jpg" alt="작품">'
    + '<p>[슬라이더입니다!] images=&lt;&lt;&lt;/images/a.jpg#$%^/images/b.gif&gt;&gt;&gt; '
    + 'images_cap=&lt;&lt;&lt;첫 장#$%^둘째 &amp; 장&gt;&gt;&gt; [!슬라이더입니다]</p>';
  const visited = [];
  const result = await rewriteMediaHtml(html, async url => {
    visited.push(url);
    return `/media/${encodeURIComponent(url.split('/').pop())}`;
  });
  assert.deepEqual(visited, ['/images/한글 사진.jpg', '/images/a.jpg', '/images/b.gif']);
  assert.match(result, /src="\/media\/%ED%95%9C%EA%B8%80%20%EC%82%AC%EC%A7%84.jpg"/);
  assert.ok(result.includes('images=&lt;&lt;&lt;/media/a.jpg#$%^/media/b.gif&gt;&gt;&gt;'));
  assert.ok(result.includes('images_cap=&lt;&lt;&lt;첫 장#$%^둘째 &amp; 장&gt;&gt;&gt;'));
  assert.ok(result.includes('<p>본문 &amp; 글</p>'));
});

test('unencoded legacy markers and image URL entities are supported', async () => {
  const seen = [];
  const original = '<img src="https://example.com/image?a=1&amp;b=2">'
    + '<p>images=<<</images/a.jpg#$%^/images/b.jpg>>> images_cap=<<<A#$%^B>>></p>';
  const result = await rewriteMediaHtml(original, async url => {
    seen.push(url);
    return url.startsWith('/images/') ? url.replace('/images/', '/media/') : url;
  });
  assert.equal(seen[0], 'https://example.com/image?a=1&b=2');
  assert.ok(result.includes('images=<<</media/a.jpg#$%^/media/b.jpg>>>'));
  assert.ok(result.includes('images_cap=<<<A#$%^B>>>'));
  assert.ok(result.includes('a=1&amp;b=2'));
});

test('inline images decode exactly and invalid base64 cannot silently truncate', () => {
  const bytes = Buffer.from([0, 1, 2, 200, 255]);
  const parsed = parseDataImage(`data:image/png;base64,${bytes.toString('base64')}`);
  assert.equal(parsed.mimeType, 'image/png');
  assert.deepEqual(parsed.bytes, bytes);
  assert.throws(() => parseDataImage('data:image/png;base64,ABC'));
  assert.throws(() => parseDataImage('data:text/html;base64,PGgxPg=='));
  assert.throws(() => parseDataImage('data:image/png;base64,'));
});

test('checksums detect changed image bytes without defining image identity', () => {
  assert.equal(hashBytes(Buffer.from('same artwork')), hashBytes(Buffer.from('same artwork')));
  assert.notEqual(hashBytes(Buffer.from('same artwork')), hashBytes(Buffer.from('changed artwork')));
});

test('media UUIDs survive saved mapping reuse and old hash identities are replaced', () => {
  const identities = {};
  const original = getMediaIdentity(identities, '/images/artwork.jpg', 'public');
  const reloaded = JSON.parse(JSON.stringify(identities));
  assert.match(original, UUID_PATTERN);
  assert.equal(getMediaIdentity(reloaded, '/images/artwork.jpg', 'public'), original);
  const privateId = getMediaIdentity(reloaded, '/images/artwork.jpg', 'private');
  assert.notEqual(privateId, original);
  assert.ok(MEDIA_KEY_PATTERN.test(`images/${privateId}.jpg`));
  assert.ok(!MEDIA_KEY_PATTERN.test(`images/private-${hashBytes(Buffer.from('image'))}.jpg`));
  const legacyKey = mediaIdentityKey('/images/old.jpg', 'private');
  reloaded[legacyKey] = `private-${hashBytes(Buffer.from('image'))}`;
  assert.match(getMediaIdentity(reloaded, '/images/old.jpg', 'private'), UUID_PATTERN);
});

test('typed media links replace only unedited initial imports and deduplicate links', () => {
  const postSql = mediaLinksSql('post', "artist's-post", ['media-one', 'media-one']).join('\n');
  assert.equal((postSql.match(/INSERT INTO post_media/g) || []).length, 1);
  assert.ok(postSql.includes("DELETE FROM post_media WHERE post_id='artist''s-post'"));
  assert.ok(postSql.includes('FROM posts'));
  assert.equal((postSql.match(/AND version=1/g) || []).length, 2);
  assert.ok(postSql.includes('ON CONFLICT(post_id,media_id) DO NOTHING'));
  const pageSql = mediaLinksSql('page', 'memo', []).join('\n');
  assert.ok(pageSql.includes("DELETE FROM page_media WHERE page_slug='memo'"));
  assert.ok(pageSql.includes("FROM pages WHERE slug='memo' AND version=1"));
  assert.throws(() => mediaLinksSql('other', 'x', []));
});

test('SQL preserves Korean, quotes, line breaks and refuses nonfinite values', () => {
  const sql = insertSql('posts', { id: 'legacy-1', title: "작가's 작품\n둘째 줄", cover_url: null, version: 1 }, 'id', true);
  assert.ok(sql.includes("'작가''s 작품\n둘째 줄'"));
  assert.ok(sql.includes('NULL'));
  assert.ok(sql.endsWith('WHERE posts.version=1;'));
  assert.throws(() => insertSql('posts', { id: 'x', version: NaN }, 'id'));
});

test('legacy route inventory preserves all twelve existing direct routes', () => {
  assert.equal(LEGACY_POSTS.length, 12);
  assert.equal(new Set(LEGACY_POSTS).size, 12);
  assert.ok(LEGACY_POSTS.includes('thinking about pebble'));
  assert.ok(LEGACY_POSTS.includes('신원계 新圓界 - 파고착조 破觚斲雕_'));
});

test('diagnostics distinguish inline images, ephemeral URLs and media blocks', () => {
  assert.deepEqual(inspectHtml('data:image/png;base64,AA== blob:https://old [슬라이더입니다!] [비디오입니다!]'), {
    inlineImages: 1, blobReferences: 1, sliders: 1, videos: 1,
  });
  assert.equal(decodeEntities('A&amp;B &#xD55C; &#44544;'), 'A&B 한 글');
});
