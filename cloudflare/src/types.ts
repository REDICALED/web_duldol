export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  ENVIRONMENT?: string;
  APP_ORIGIN?: string;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  ADMIN_EMAILS?: string;
  DEV_AUTH_BYPASS?: string;
  R2_ACCOUNT_ID?: string;
  R2_BUCKET_NAME?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
}

export interface PostRow {
  id: string; slug: string; title: string; work_date: string;
  content_html: string; cover_media_id: string | null; cover_url: string | null;
  cover_object_key?: string | null;
  status: 'draft' | 'published' | 'archived'; is_listed: number;
  sort_order: number; featured_order: number | null; version: number;
  revision_id: string; created_at: string; updated_at: string;
}

export interface PageRow {
  slug: string; title: string; content_html: string;
  visibility: 'public' | 'private'; version: number; revision_id: string;
  created_at: string; updated_at: string;
}

export interface MediaRow {
  id: string; object_key: string; upload_key: string | null;
  mime_type: string; size: number; original_filename: string;
  source_url: string | null; status: 'pending' | 'ready';
  visibility: 'public' | 'private'; created_at: string; updated_at: string;
}
