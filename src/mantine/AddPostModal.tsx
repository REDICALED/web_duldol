import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import AddPhoto from '@/assets/icons/AddPhoto.png';
import ImageUpload from '@/components/TipTap/ImageUpload';

export default function AddPostModal({ editor }: { editor: any }) {
  const [opened, { open, close }] = useDisclosure(false);
  return <>
    <Modal size="xl" opened={opened} onClose={close} title="본문 이미지">
      <ImageUpload multiple onUpload={assets => {
        for (const asset of assets) editor.chain().focus().setImage({ src: asset.url }).run();
        close();
      }} />
    </Modal>
    <button type="button" aria-label="본문 이미지 추가" className="border border-black p-[10px] hover:bg-gray-200" onClick={open}>
      <img src={AddPhoto} className="w-5 h-5" alt="" />
    </button>
  </>;
}
