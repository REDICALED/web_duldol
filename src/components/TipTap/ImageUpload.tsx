import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { PostGenreType } from '@/atoms/PostingAtom';
import { errorMessage, uploadImage, type StoredAsset } from '@/lib/admin-api';

export default function ImageUpload({ onUpload, multiple = false, label = '이미지 업로드' }: {
  onUpload: (assets: StoredAsset[]) => void;
  multiple?: boolean;
  label?: string;
}) {
  const genre = useRecoilValue(PostGenreType);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <div className="my-2">
    <label className="block text-sm">
      {busy ? '이미지 업로드 중…' : label}
      <input className="block my-2 max-w-full text-xs" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple={multiple} disabled={busy}
        onChange={async event => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = '';
          if (!files.length) return;
          setBusy(true); setError('');
          try {
            const assets: StoredAsset[] = [];
            for (const file of files) assets.push(await uploadImage(file, genre === 'memo' ? 'private' : 'public'));
            onUpload(assets);
          } catch (cause) { setError(errorMessage(cause)); }
          finally { setBusy(false); }
        }} />
    </label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </div>;
}
