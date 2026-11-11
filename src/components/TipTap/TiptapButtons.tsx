import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { tiptapMainText } from '@/atoms/TiptapAtom';
import { apiRequest, sanitizeContentHtml, type ContentPost, type ContentPage } from '@/lib/content-api';
import { errorMessage } from '@/lib/admin-api';
import SetContents from './SetContents';
import SetTitleImage from './SetTitleImage';

export function UploadButton(props: any) {
  const [busy, setBusy] = useState(false);
  return <button className="border p-3 disabled:opacity-50" type="button" disabled={busy || !props.tiptapeditor} onClick={async () => {
    props.setError(''); props.setMessage(''); setBusy(true); props.setDocumentBusy(true);
    try {
      const content_html = props.getHtml();
      if (props.GenreType === 'post') {
        if (!props.tiptapPostTitle.trim() || !props.tiptapPostDate || !props.tiptapPostTitleImage.blobUrl) throw new Error('제목, 날짜, 대표 이미지를 입력해주세요.');
        const { post } = await apiRequest<{ post: ContentPost }>(props.editingId ? `/admin/posts/${encodeURIComponent(props.editingId)}` : '/admin/posts', {
          method: props.editingId ? 'PUT' : 'POST',
          json: {
            title: props.tiptapPostTitle.trim(), work_date: props.tiptapPostDate, content_html,
            cover_url: props.tiptapPostTitleImage.blobUrl, cover_asset_key: props.coverAssetKey,
            status: props.status, is_listed: props.isListed, sort_order: props.sortOrder,
            featured_order: props.featuredOrder,
            ...(props.editingId ? { version: props.version } : {}),
          },
        });
        props.setEditingId(post.id); props.setVersion(post.version);
      } else {
        if (props.version === null) throw new Error('페이지를 먼저 불러온 뒤 수정해주세요.');
        const { page } = await apiRequest<{ page: ContentPage }>(`/admin/pages/${encodeURIComponent(props.GenreType)}`, {
          method: 'PUT', json: { content_html, title: props.GenreType, visibility: props.GenreType === 'memo' ? 'private' : 'public', version: props.version },
        });
        props.setVersion(page.version);
      }
      props.setMessage('저장했습니다. 사이트를 새로고침하면 반영됩니다.');
    } catch (error) { props.setError(errorMessage(error)); }
    finally { setBusy(false); props.setDocumentBusy(false); }
  }}>{busy ? '저장 중…' : props.editingId || props.GenreType !== 'post' ? '변경사항 저장' : '작품 등록'}</button>;
}

export function UploadPreviewButton(props: any) {
  const setMainText = useSetRecoilState(tiptapMainText);
  return <button className="border p-3" type="button" onClick={() => {
    setMainText(sanitizeContentHtml(props.getHtml())); props.setPreviewSwitch(!props.PreviewSwitch);
  }}>미리보기</button>;
}

export function SetGenreButton(props: any) {
  return <div className="space-y-2">
    <label>편집 대상 <select className="border p-2" value={props.GenreType} onChange={event => props.resetDocument(event.target.value)}>
      <option value="post">작품</option><option value="note">Note</option><option value="cv">CV</option><option value="contact">Contact</option><option value="memo">비공개 메모</option>
    </select></label>
    {props.GenreType === 'post' ? <><button className="border p-2 ml-2" type="button" onClick={() => props.resetDocument('post')}>새 작품</button><SetTitleImage {...props} /></> : <SetContents {...props} />}
  </div>;
}
