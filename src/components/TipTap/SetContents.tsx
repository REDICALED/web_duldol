import { useState } from 'react';
import { apiRequest, type ContentPage } from '@/lib/content-api';
import { errorMessage } from '@/lib/admin-api';

export default function SetContents(props: any) {
  const [busy, setBusy] = useState(false);
  return <button className="border p-2 ml-2" disabled={busy} type="button" onClick={async () => {
    setBusy(true); props.setDocumentBusy(true); props.setError('');
    try {
      const { page } = await apiRequest<{ page: ContentPage }>(`/admin/pages/${encodeURIComponent(props.GenreType)}`);
      props.setVersion(page.version); props.loadHtml(page.content_html);
    } catch (cause) { props.setError(errorMessage(cause)); }
    finally { setBusy(false); props.setDocumentBusy(false); }
  }}>{busy ? '불러오는 중…' : '페이지 불러오기'}</button>;
}
