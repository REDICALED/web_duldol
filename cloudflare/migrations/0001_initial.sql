PRAGMA foreign_keys = ON;

CREATE TABLE media (
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

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  work_date TEXT NOT NULL,
  content_html TEXT NOT NULL DEFAULT '',
  cover_asset_key TEXT REFERENCES media(object_key) ON DELETE RESTRICT,
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
CREATE INDEX posts_public_order ON posts(status, is_listed, sort_order, work_date DESC);
CREATE INDEX posts_featured_order ON posts(status, featured_order);

CREATE TABLE pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  content_html TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  version INTEGER NOT NULL DEFAULT 1,
  revision_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (slug != 'memo' OR visibility = 'private')
);

CREATE TABLE media_references (
  media_id TEXT NOT NULL REFERENCES media(id) ON DELETE RESTRICT,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('post', 'page')),
  owner_id TEXT NOT NULL,
  PRIMARY KEY (media_id, owner_type, owner_id)
);
CREATE INDEX media_reference_owner ON media_references(owner_type, owner_id);

INSERT INTO pages (slug, title, visibility) VALUES
  ('cv', 'CV', 'public'),
  ('contact', 'Contact', 'public'),
  ('note', 'Note', 'public'),
  ('memo', 'Memo', 'private');
