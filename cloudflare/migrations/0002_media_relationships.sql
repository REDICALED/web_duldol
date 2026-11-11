-- Preserve existing files and URLs while replacing storage-key relationships
-- with media IDs and foreign-key-backed document/media join tables.
-- Wrangler applies this migration as a transaction. Do not edit 0001.

CREATE TABLE _media_migration_checks (invalid_rows INTEGER NOT NULL CHECK (invalid_rows = 0));

INSERT INTO _media_migration_checks
SELECT COUNT(*) FROM posts p LEFT JOIN media m ON m.object_key = p.cover_asset_key
WHERE p.cover_asset_key IS NOT NULL AND m.id IS NULL;

INSERT INTO _media_migration_checks
SELECT COUNT(*) FROM media_references r
LEFT JOIN media m ON m.id = r.media_id
LEFT JOIN posts p ON r.owner_type = 'post' AND p.id = r.owner_id
LEFT JOIN pages pg ON r.owner_type = 'page' AND pg.slug = r.owner_id
WHERE m.id IS NULL OR (r.owner_type = 'post' AND p.id IS NULL) OR (r.owner_type = 'page' AND pg.slug IS NULL);

CREATE TABLE _media_id_map (old_id TEXT PRIMARY KEY, new_id TEXT NOT NULL UNIQUE);
INSERT INTO _media_id_map (old_id, new_id)
SELECT id,
  CASE WHEN length(id) = 36
    AND id GLOB '????????-????-????-????-????????????'
    AND lower(replace(id, '-', '')) NOT GLOB '*[^0-9a-f]*'
  THEN id
  ELSE lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', (random() & 3) + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))
  END
FROM media;

CREATE TABLE media_v2 (
  id TEXT PRIMARY KEY,
  object_key TEXT NOT NULL UNIQUE,
  upload_key TEXT,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL CHECK (size >= 0),
  original_filename TEXT NOT NULL,
  source_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
INSERT INTO media_v2 (id, object_key, upload_key, mime_type, size, original_filename, source_url, visibility, status, created_at, updated_at)
SELECT map.new_id, m.object_key, m.upload_key, m.mime_type, m.size, m.original_filename, m.source_url, m.visibility, m.status, m.created_at, m.updated_at
FROM media m JOIN _media_id_map map ON map.old_id = m.id;

CREATE TABLE posts_v2 (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  work_date TEXT NOT NULL,
  content_html TEXT NOT NULL DEFAULT '',
  cover_media_id TEXT REFERENCES media_v2(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  cover_url TEXT,
  is_listed INTEGER NOT NULL DEFAULT 1 CHECK (is_listed IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  featured_order INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  version INTEGER NOT NULL DEFAULT 1,
  revision_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
INSERT INTO posts_v2 (id, slug, title, work_date, content_html, cover_media_id, cover_url, is_listed, sort_order, featured_order, status, version, revision_id, created_at, updated_at)
SELECT p.id, p.slug, p.title, p.work_date, p.content_html, map.new_id, p.cover_url, p.is_listed, p.sort_order, p.featured_order, p.status, p.version, p.revision_id, p.created_at, p.updated_at
FROM posts p
LEFT JOIN media m ON m.object_key = p.cover_asset_key
LEFT JOIN _media_id_map map ON map.old_id = m.id;

CREATE TABLE post_media (
  post_id TEXT NOT NULL REFERENCES posts_v2(id) ON UPDATE CASCADE ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES media_v2(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  PRIMARY KEY (post_id, media_id)
);
CREATE INDEX post_media_media_id ON post_media(media_id);

CREATE TABLE page_media (
  page_slug TEXT NOT NULL REFERENCES pages(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES media_v2(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  PRIMARY KEY (page_slug, media_id)
);
CREATE INDEX page_media_media_id ON page_media(media_id);

INSERT INTO post_media (post_id, media_id)
SELECT r.owner_id, map.new_id FROM media_references r
JOIN _media_id_map map ON map.old_id = r.media_id WHERE r.owner_type = 'post';
INSERT INTO post_media (post_id, media_id)
SELECT id, cover_media_id FROM posts_v2 WHERE cover_media_id IS NOT NULL
ON CONFLICT(post_id, media_id) DO NOTHING;
INSERT INTO page_media (page_slug, media_id)
SELECT r.owner_id, map.new_id FROM media_references r
JOIN _media_id_map map ON map.old_id = r.media_id WHERE r.owner_type = 'page';

DROP TABLE media_references;
DROP TABLE posts;
DROP TABLE media;
ALTER TABLE media_v2 RENAME TO media;
ALTER TABLE posts_v2 RENAME TO posts;

CREATE INDEX posts_public_order ON posts(status, is_listed, sort_order, work_date DESC);
CREATE INDEX posts_featured_order ON posts(status, featured_order);
CREATE INDEX posts_cover_media_id ON posts(cover_media_id);
DROP TABLE _media_id_map;
DROP TABLE _media_migration_checks;
