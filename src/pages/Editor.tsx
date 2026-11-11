import '@/styles.scss';
import { EditorProvider, type Editor as TiptapEditor } from '@tiptap/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { PostGenreType } from '@/atoms/PostingAtom';
import { tiptapMainText } from '@/atoms/TiptapAtom';
import MenuBar from '@/components/TipTap/MenuBar';
import extensions from '@/components/TipTap/Extensions';
import Preview from '@/components/TipTap/Preview';
import ImageUpload from '@/components/TipTap/ImageUpload';
import Postlist from '@/components/TipTap/Postlist';
import { UploadButton, SetGenreButton, UploadPreviewButton } from '@/components/TipTap/TiptapButtons';
import useAdminSession from '@/hooks/useAdminSession';
import { CONTENT_API_ENABLED, sanitizeContentHtml } from '@/lib/content-api';

export default function Editor() {
  const { session, error: sessionError } = useAdminSession();
  const [tiptapeditor, settiptapeditor] = useState<TiptapEditor | null>(null);
  const [tiptapPostDate, settiptapPostDate] = useState('');
  const [tiptapPostTitleImage, settiptapPostTitleImage] = useState({ blobUrl: '' });
  const [tiptapPostTitle, settiptapPostTitle] = useState('');
  const [coverAssetKey, setCoverAssetKey] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [version, setVersion] = useState<number | null>(null);
  const [status, setStatus] = useState('published');
  const [isListed, setIsListed] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [featuredOrder, setFeaturedOrder] = useState<number | null>(null);
  const [sourceHtml, setSourceHtml] = useState('');
  const [rawMode, setRawMode] = useState(false);
  const [PreviewSwitch, setPreviewSwitch] = useState(false);
  const [GenreType, setGenreType] = useRecoilState(PostGenreType);
  const setMainText = useSetRecoilState(tiptapMainText);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [documentBusy, setDocumentBusy] = useState(false);

  const resetDocument = (genre = GenreType) => {
    setGenreType(genre); setEditingId(null); setVersion(null);
    settiptapPostTitle(''); settiptapPostDate(''); settiptapPostTitleImage({ blobUrl: '' });
    setCoverAssetKey(null); setSourceHtml(''); setRawMode(false); setMainText('');
    setStatus('published'); setIsListed(true); setSortOrder(0); setFeaturedOrder(null);
    setMessage(''); setError(''); tiptapeditor?.commands.clearContent();
  };

  const props = {
    tiptapeditor, settiptapeditor, tiptapPostDate, settiptapPostDate, tiptapPostTitleImage,
    settiptapPostTitleImage, tiptapPostTitle, settiptapPostTitle, PreviewSwitch, setPreviewSwitch,
    GenreType, coverAssetKey, setCoverAssetKey, editingId, setEditingId, version, setVersion,
    status, setStatus, isListed, setIsListed, sortOrder, setSortOrder, featuredOrder, setFeaturedOrder,
    sourceHtml, setSourceHtml, rawMode, setRawMode, setMessage, setError, resetDocument,
    documentBusy, setDocumentBusy,
    getHtml: () => rawMode ? sourceHtml : tiptapeditor?.getHTML() ?? '',
    loadHtml: (html: string) => {
      setSourceHtml(html); setRawMode(true);
      setMainText(sanitizeContentHtml(html)); setMessage('불러왔습니다. 원문 편집 모드로 기존 서식을 유지합니다.'); setError('');
    },
  };

  if (!CONTENT_API_ENABLED) return <div className="p-8">콘텐츠 서버 연결 후 관리자 기능을 사용할 수 있습니다. <Link className="underline" to="/">홈으로</Link></div>;
  if (!session) return <p className="p-8">관리자 권한 확인 중…</p>;
  if (!session.authenticated) return <div className="p-8 space-y-3"><p>{sessionError || '관리자 로그인이 필요합니다.'}</p><Link className="underline" to="/login">로그인</Link></div>;

  return <div className="p-4 text-dul-gray">
    <div className="flex justify-between items-center mb-4"><h1 className="text-xl">콘텐츠 편집</h1><Link to="/">사이트 보기</Link></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <fieldset disabled={documentBusy} className="min-w-0">
        <SetGenreButton {...props} />
        {rawMode && <div className="my-3 space-y-2">
          <p className="text-sm">불러온 글은 원문 HTML로 편집합니다. 시각 편집기로 전환하면 지원되지 않는 서식이 단순해질 수 있습니다.</p>
          <textarea aria-label="본문 HTML" className="border p-3 w-full h-[45vh] font-mono text-xs" value={sourceHtml} onChange={event => setSourceHtml(event.target.value)} />
          <ImageUpload multiple label="본문에 이미지 추가" onUpload={assets => setSourceHtml(current => current + assets.map(asset => `<p><img src="${asset.url}" alt=""></p>`).join(''))} />
          <button className="border p-2 text-sm" type="button" onClick={() => {
            tiptapeditor?.commands.setContent(sanitizeContentHtml(sourceHtml)); setRawMode(false);
          }}>시각 편집기로 전환</button>
        </div>}
        <div hidden={rawMode}><EditorProvider slotBefore={<MenuBar {...props} />} extensions={extensions} content="" /></div>
        {!rawMode && <button className="border p-2 mt-2 text-sm" type="button" onClick={() => {
          setSourceHtml(tiptapeditor?.getHTML() ?? ''); setRawMode(true);
        }}>원문 편집</button>}
        {GenreType === 'post' && <label className="block my-2">공개 상태 <select className="border p-2" value={status} onChange={event => setStatus(event.target.value)}>
          <option value="published">공개</option><option value="draft">초안</option>
        </select></label>}
        <div className="flex gap-2 my-3"><UploadButton {...props} /><UploadPreviewButton {...props} /></div>
        {message && <p role="status" className="text-sm">{message}</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </fieldset>
      <section>
        {GenreType === 'post' && <Postlist {...props} />}
        <div className="preview border p-4 h-[70vh] overflow-auto text-xs leading-6"><Preview /></div>
      </section>
    </div>
  </div>;
}
