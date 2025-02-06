import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import { useState } from 'react';
import Gif from '@/assets/icons/gif.png'

export default function AddPostModal({ editor }: { editor: any }) {
    const [opened, { open, close }] = useDisclosure(false);
  const [inputimageurl, setInputImageUrl] = useState<string>("");
  const [previewurl, setPreviewUrl] = useState<string>("");

  const parse_image_id = (url: string) => {
    const match = url.match(/\/d\/(.*?)\//);
    const fileId = match ? match[1] : '';
    setPreviewUrl(`https://lh3.googleusercontent.com/d/${fileId}`);
    console.log(`https://lh3.googleusercontent.com/d/${fileId}`)
    return fileId;
  }

  return (
    <>
      <Modal size={'xl'} opened={opened} onClose={close} title="Add GIF!">
         <div className='italic opacity-75'>구글 드라이브 내의 이미지를 공유, 링크가 있는 사용자들 모두 볼 수 있게 설정해주세용 </div>

        <div className="p-10">
          <input
            placeholder="Image URL"
            onChange={(e) => {
                setInputImageUrl(e.target.value)
            }}
          className='border-2 border-black w-full' type="text" />
          <button type="button" className='mt-2 border-2 border-black p-2' onClick={() => {
            parse_image_id(inputimageurl);
          }}>
            불러오기
          </button>
        </div>
        {
            previewurl !== "" && (
                
                <>
                    <div className=" border-2 border-black flex justify-center">
                        <img src={previewurl} className="w-1/2 h-1/2"/>
                    </div>

                    <div>
                        <button type="button" className='mt-2 border-2 border-black p-2' onClick={() => {
                            editor.commands.insertContent(`<img src="${previewurl}" alt="images" referrerPolicy="no-referrer"  />`);
                            close();
                        }}>
                            삽입
                        </button>
                    </div>
                </>
            )

        }
      </Modal>

      <button
        type="button"
        className="relative cursor-pointer border border-black p-[10px] hover:bg-gray-200  "
        onClick={open}>

        <img src={Gif} className="w-5 h-5"/>
  
      </button>
    </>
  );
}