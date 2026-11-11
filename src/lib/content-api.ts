import DOMPurify from 'dompurify';

export interface ContentPost {
  id: string;
  slug: string;
  title: string;
  work_date: string;
  year: string;
  hashdate: number;
  cover_url: string;
  cover_media_id?: string | null;
  titleimg: string;
  content_html: string;
  status: 'draft' | 'published';
  is_listed: boolean | number;
  sort_order: number;
  featured_order?: number | null;
  version: number;
}

export interface ContentPage {
  slug: string;
  title: string;
  content_html: string;
  visibility?: 'public' | 'private';
  version: number;
}

export interface AdminSession {
  authenticated: boolean;
  email?: string;
  subject?: string;
  login_url?: string;
}

const configuredBase = (import.meta.env.VITE_CONTENT_API_URL as string | undefined)?.trim().replace(/\/+$/, '') ?? '';
export const CONTENT_API_ENABLED = configuredBase.length > 0;
const apiBase = configuredBase || '/api';

export class ContentApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly payload?: unknown) {
    super(message);
    this.name = 'ContentApiError';
  }
}

export function contentApiUrl(path: string): string {
  const suffix = `/${path.replace(/^\/?api(?:\/|$)/, '').replace(/^\/+/, '')}`;
  return `${apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`}${suffix}`;
}

type ApiOptions = RequestInit & { json?: unknown };

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { json, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (json !== undefined) headers.set('Content-Type', 'application/json');
  const response = await fetch(contentApiUrl(path), {
    ...init,
    credentials: 'include',
    redirect: 'error',
    headers,
    body: json !== undefined ? JSON.stringify(json) : init.body,
  });
  const body = await response.text();
  let payload: unknown;
  try {
    payload = body ? JSON.parse(body) : undefined;
  } catch {
    throw new ContentApiError('콘텐츠 서버의 응답 형식을 확인해주세요.', response.status);
  }
  if (!response.ok) {
    const error = payload as { error?: string | { message?: string }; message?: string } | undefined;
    const message = typeof error?.error === 'string' ? error.error : error?.error?.message ?? error?.message;
    throw new ContentApiError(message || `요청을 처리하지 못했습니다. (${response.status})`, response.status, payload);
  }
  return payload as T;
}

export async function adminSession(): Promise<AdminSession> {
  if (!CONTENT_API_ENABLED) return { authenticated: false };
  try {
    return await apiRequest<AdminSession>('/admin/session');
  } catch (error) {
    if (error instanceof ContentApiError && error.status === 401) {
      const session = error.payload as Partial<AdminSession> | undefined;
      return { authenticated: false, login_url: session?.login_url || contentApiUrl('/admin/login?return_to=%2FEditor') };
    }
    // Access may answer with a login redirect or HTML before the API can return JSON.
    return { authenticated: false, login_url: contentApiUrl('/admin/login?return_to=%2FEditor') };
  }
}

function normalizePost(post: Partial<ContentPost> & { title: string }): ContentPost {
  const id = String(post.id ?? (post.hashdate ? post.hashdate : post.slug ?? post.title));
  const workDate = post.work_date ?? post.year ?? '';
  const cover = post.cover_url || post.titleimg || '';
  return {
    ...post,
    id,
    slug: post.slug || id,
    title: post.title,
    work_date: workDate,
    year: workDate,
    hashdate: post.hashdate ?? (/^\d+$/.test(id) ? Number(id) : 0),
    titleimg: cover,
    cover_url: post.cover_url || cover,
    content_html: post.content_html ?? '',
    status: post.status ?? 'published',
    is_listed: post.is_listed ?? true,
    sort_order: post.sort_order ?? 0,
    version: post.version ?? 1,
  };
}

async function staticResponse(path: string): Promise<Response> {
  const response = await fetch(path);
  if (!response.ok) throw new ContentApiError('콘텐츠를 찾을 수 없습니다.', response.status);
  return response;
}

export async function getPosts(options: { featured?: boolean } = {}): Promise<ContentPost[]> {
  const data = CONTENT_API_ENABLED
    ? await apiRequest<{ posts: ContentPost[] }>(`/posts${options.featured ? '?featured=1' : ''}`)
    : await (await staticResponse('/Posts.json')).json() as { posts: ContentPost[] };
  return data.posts.map(normalizePost);
}

export function postPath(post: ContentPost): string {
  return `/Works/${encodeURIComponent(CONTENT_API_ENABLED ? post.slug || post.id : post.hashdate ? String(post.hashdate) : post.title)}`;
}

export function postCover(post: ContentPost): string {
  return safeImageUrl(post.titleimg) || (!CONTENT_API_ENABLED && post.hashdate === 0 ? `/images/Works/${post.title}/title.jpg` : '');
}

export async function getPost(id: string): Promise<ContentPost> {
  if (CONTENT_API_ENABLED) {
    const { post } = await apiRequest<{ post: ContentPost }>(`/posts/${encodeURIComponent(id)}`);
    return { ...normalizePost(post), content_html: sanitizeContentHtml(post.content_html) };
  }
  const posts = await getPosts();
  const post = posts.find(item => item.id === id || item.slug === id || item.title === id || (item.hashdate !== 0 && String(item.hashdate) === id));
  if (!post || post.hashdate === 0) throw new ContentApiError('작품을 찾을 수 없습니다.', 404);
  const html = await (await staticResponse(`/Posts/Works/${post.hashdate}/main.html`)).text();
  return { ...post, content_html: sanitizeContentHtml(html) };
}

export async function getPage(slug: string): Promise<ContentPage> {
  if (slug === 'memo') throw new ContentApiError('관리자 권한이 필요합니다.', 403);
  if (CONTENT_API_ENABLED) {
    const { page } = await apiRequest<{ page: ContentPage }>(`/pages/${encodeURIComponent(slug)}`);
    return { ...page, content_html: sanitizeContentHtml(page.content_html) };
  }
  const content = await (await staticResponse(`/Posts/${encodeURIComponent(slug)}.html`)).text();
  return { slug, title: slug, content_html: sanitizeContentHtml(content), version: 1 };
}

export async function getAdminPage(slug: string): Promise<ContentPage> {
  if (!CONTENT_API_ENABLED) throw new ContentApiError('콘텐츠 API를 연결한 뒤 사용할 수 있습니다.', 503);
  const { page } = await apiRequest<{ page: ContentPage }>(`/admin/pages/${encodeURIComponent(slug)}`);
  return { ...page, content_html: sanitizeContentHtml(page.content_html) };
}

export function safeImageUrl(value: string | undefined | null): string {
  if (!value || /[\u0000-\u001f\u007f]/.test(value)) return '';
  try {
    const url = new URL(value.trim(), window.location.origin);
    return ['https:', 'http:'].includes(url.protocol) ? value.trim() : '';
  } catch {
    return '';
  }
}

function safeVideoUrl(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    if (url.hostname === 'player.vimeo.com' && /^\/video\/\d+\/?$/.test(url.pathname)) return url.href;
    if (['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com'].includes(url.hostname)
      && /^\/embed\/[\w-]+\/?$/.test(url.pathname)) return url.href;
  } catch {
    return '';
  }
  return '';
}

/** Keep legacy Tiptap HTML and gallery markers while rejecting active content. */
export function sanitizeContentHtml(html: string): string {
  const clean = DOMPurify.sanitize(html || '', {
    USE_PROFILES: { html: true },
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder'],
    FORBID_TAGS: ['script', 'style', 'svg', 'math', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'base', 'link', 'meta'],
    FORBID_ATTR: ['srcdoc', 'srcset', 'formaction', 'xlink:href'],
    ALLOW_DATA_ATTR: false,
  });
  const template = document.createElement('template');
  template.innerHTML = clean;
  template.content.querySelectorAll('img').forEach(image => {
    const src = safeImageUrl(image.getAttribute('src'));
    if (src) image.setAttribute('src', src);
    else image.remove();
  });
  template.content.querySelectorAll('iframe').forEach(frame => {
    const src = safeVideoUrl(frame.getAttribute('src') || '');
    if (!src) { frame.remove(); return; }
    frame.setAttribute('src', src);
    frame.setAttribute('loading', 'lazy');
    frame.setAttribute('title', frame.getAttribute('title') || '동영상');
    frame.setAttribute('allow', 'fullscreen; picture-in-picture');
    frame.setAttribute('allowfullscreen', '');
  });
  template.content.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      try {
        if (!['http:', 'https:', 'mailto:', 'tel:'].includes(new URL(href, window.location.origin).protocol)) link.removeAttribute('href');
      } catch { link.removeAttribute('href'); }
    }
    if (link.getAttribute('target') === '_blank') link.setAttribute('rel', 'noopener noreferrer');
  });
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    let text = node.textContent || '';
    if (text.includes('[비디오입니다!]')) {
      const match = text.match(/Videourl=<<<([\s\S]*?)>>>/);
      const src = match ? safeVideoUrl(match[1].trim()) : '';
      text = src && match ? text.replace(match[0], `Videourl=<<<${src}>>>`) : '';
    }
    if (text.includes('[슬라이더입니다!]')) {
      const images = text.match(/images=<<<([\s\S]*?)>>>/);
      const captions = text.match(/images_cap=<<<([\s\S]*?)>>>/);
      if (images) {
        const captionList = captions?.[1].split('#$%^') || [];
        const valid = images[1].split('#$%^').map((src, index) => ({ src: safeImageUrl(src.trim()), caption: captionList[index] || '' })).filter(item => item.src);
        text = text.replace(images[0], `images=<<<${valid.map(item => item.src).join('#$%^')}>>>`);
        if (captions) text = text.replace(captions[0], `images_cap=<<<${valid.map(item => item.caption).join('#$%^')}>>>`);
        if (!valid.length) text = '';
      } else text = '';
    }
    node.textContent = text;
    node = walker.nextNode();
  }
  return template.innerHTML;
}
