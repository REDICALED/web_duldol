import { useState } from 'react';
import { apiRequest, type ContentPost } from '@/lib/content-api';
import { errorMessage } from '@/lib/admin-api';

export default function Postlist(props: any) {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [busy, setBusy] = useState(false);
  const refresh = async () => {
    const result = await apiRequest<{ posts: ContentPost[] }>('/admin/posts'); setPosts(result.posts);
  };
  const run = async (operation: () => Promise<void>) => {
    setBusy(true); props.setDocumentBusy(true); props.setError('');
    try { await operation(); } catch (cause) { props.setError(errorMessage(cause)); }
    finally { setBusy(false); props.setDocumentBusy(false); }
  };
  return <div className="mb-4">
    <button className="border p-2" type="button" disabled={busy || props.documentBusy} onClick={() => run(refresh)}>작품 목록 불러오기</button>
    <div className="max-h-[35vh] overflow-auto">
      {posts.map(post => <div className="border-b py-2 flex gap-2 items-center text-xs" key={post.id}>
        {post.titleimg && <img src={post.titleimg} alt="" className="w-10 h-10 object-cover" />}
        <span className="grow">{post.title} · {post.year} {post.status === 'draft' ? '(초안)' : ''}</span>
        <button className="border p-1" type="button" disabled={busy || props.documentBusy} onClick={() => run(async () => {
          const { post: current } = await apiRequest<{ post: ContentPost }>(`/admin/posts/${encodeURIComponent(post.id)}`);
          props.setEditingId(current.id); props.setVersion(current.version);
          props.settiptapPostTitle(current.title); props.settiptapPostDate(current.work_date);
          props.settiptapPostTitleImage({ blobUrl: current.cover_url || current.titleimg });
          props.setCoverMediaId(current.cover_media_id ?? null); props.setStatus(current.status);
          props.setIsListed(Boolean(current.is_listed)); props.setSortOrder(current.sort_order);
          props.setFeaturedOrder(current.featured_order ?? null); props.loadHtml(current.content_html);
        })}>편집</button>
        <button className="border p-1 text-red-700" type="button" disabled={busy || props.documentBusy} onClick={() => {
          if (!window.confirm(`‘${post.title}’ 작품을 삭제할까요?`)) return;
          void run(async () => {
            await apiRequest(`/admin/posts/${encodeURIComponent(post.id)}`, { method: 'DELETE', json: { version: post.version } });
            if (props.editingId === post.id) props.resetDocument('post');
            await refresh(); props.setMessage('작품을 삭제했습니다.');
          });
        }}>삭제</button>
      </div>)}
    </div>
  </div>;
}
