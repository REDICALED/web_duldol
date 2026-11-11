import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import { useState } from 'react';
import AddSlider from '@/assets/icons/AddSlider.png';
import ImageUpload from '@/components/TipTap/ImageUpload';
import type { StoredAsset } from '@/lib/admin-api';

export default function AddSliderModal({ editor }: { editor: any }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [images, setImages] = useState<Array<{ asset: StoredAsset; caption: string }>>([]);
  return <>
    <Modal size="xl" opened={opened} onClose={close} title="슬라이더 이미지">
      <ImageUpload multiple onUpload={assets => setImages(current => [...current, ...assets.map(asset => ({ asset, caption: '' }))])} />
      <p className="text-xs">표시된 순서로 슬라이더에 들어갑니다.</p>
      {images.map((image, index) => <div key={image.asset.id} className="flex gap-2 my-2 items-center">
        <img src={image.asset.url} alt="" className="w-16 h-16 object-cover" />
        <input className="border p-1 w-full" aria-label={`${index + 1}번째 이미지 설명`} value={image.caption} onChange={event => setImages(current => current.map((entry, i) => i === index ? { ...entry, caption: event.target.value } : entry))} />
        <button type="button" onClick={() => setImages(current => current.filter((_, i) => i !== index))}>제거</button>
      </div>)}
      <button className="border p-2 mt-3" type="button" disabled={!images.length || images.some(image => /#\$%\^|>>>|\[!슬라이더입니다\]/.test(image.caption))} onClick={() => {
        const urls = images.map(image => image.asset.url).join('#$%^');
        const captions = images.map(image => image.caption).join('#$%^');
        const marker = `------ [슬라이더입니다!] images=<<<${urls}>>> images_cap=<<<${captions}>>> [!슬라이더입니다] ------`;
        editor.commands.insertContent({ type: 'paragraph', content: [{ type: 'text', text: marker }] });
        setImages([]); close();
      }}>슬라이더 삽입</button>
    </Modal>
    <button type="button" aria-label="슬라이더 추가" className="border border-black p-[10px] hover:bg-gray-200" onClick={open}>
      <img src={AddSlider} className="w-5 h-5" alt="" />
    </button>
  </>;
}
