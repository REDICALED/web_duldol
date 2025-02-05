import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import AddSlider from '@/assets/icons/AddSlider.png'
import { useState } from 'react';
import '@mantine/carousel/styles.css';
import { Carousel } from '@mantine/carousel';

export default function AddPostModal({ editor }: { editor: any }) {
    const [opened, { open, close }] = useDisclosure(false);
    const [inputFields, setInputFields] = useState<string[]>([""]); // input 필드를 배열로 관리
    const [nameFields, setNameFields] = useState<string[]>([""]); // input 필드를 배열로 관리
    const [previewurl, setPreviewUrl] = useState<string[]>([]);
    const [previewname, setPreviewName] = useState<string[]>([]);

    const parse_image_id = (url: string[], name: string[]) => {
        console.log(url)
        console.log("lenght!!!!!!!!!")
        console.log(url.length)

        setPreviewUrl([]);
        setPreviewName([]);
        const tmpurl = [];
        const tmpname = [];
        for (let i = 0; i < url.length; i++) {
            const match = url[i].match(/\/d\/(.*?)\//);
            const fileId = match ? match[1] : '';
            tmpurl.push(`https://lh3.googleusercontent.com/d/${fileId}`);
            tmpname.push(name[i]);
        }
        setPreviewUrl(tmpurl);
        setPreviewName(tmpname);
        console.log(previewurl)
    }

    // + 버튼을 눌러 새로운 input 필드 추가
    const addInputField = () => {
        setInputFields([...inputFields, ""]);
    };

    const removeInputField = () => {
        setInputFields(inputFields.slice(0, -1));
    };

    const insertslider = (url: string[], name: string[]) => {
    
      const NameStr = name.join('#$%^');
      const ImageStr = url.join('#$%^');
      
      editor.commands.insertContent(`------\n[슬라이더입니다!]\nimages=<<<${ImageStr}>>> images_cap=<<<${NameStr}>>>\n[!슬라이더입니다]\n------`);

    }

    return (
        <>
            <Modal size={'xl'} opened={opened} onClose={close} title="Add Slider!">
                <div className='italic opacity-75'>구글 드라이브 내의 이미지를 공유, 링크가 있는 사용자들 모두 볼 수 있게 설정해주세용
                 </div>
                  <div className='italic opacity-75'>혹시 에러 생기거나, 이상하게 보이면 초기화 버튼 눌러주세요!</div>

                <div className="p-10">
                    {/* 각 input 필드에 대해 map을 사용하여 렌더링 */}
                    {inputFields.map((_, index) => (
                        <div key={index} className="mb-4 flex">
                            <input
                                placeholder="Image URL"
                                onChange={(e) => {
                                    const newInputFields = [...inputFields];
                                    newInputFields[index] = e.target.value; // 입력값 변경
                                    setInputFields(newInputFields);
                                }}
                                className='border-2 border-black w-full'
                                type="text"
                            />
                            <input
                                placeholder="이미지 이름 (파일명)"
                                onChange={(e) => {
                                    const newNameFields = [...nameFields];
                                    newNameFields[index] = e.target.value; // 입력값 변경
                                    setNameFields(newNameFields);
                                }}
                                className='border-2 border-black w-full'
                                type="text"
                            />
                        </div>
                    ))}
                    <button type="button" className='mt-2 border-2 border-black p-2' onClick={() => {
                        // 첫 번째 입력필드로 파싱 (여러 개의 입력이 있어도 첫 번째 것을 파싱)
                        parse_image_id(inputFields, nameFields);
                    }}>
                        슬라이더 저장
                    </button>
                    <button type="button" className='ml-10 mt-2 border-2 border-black p-2' onClick={addInputField}>
                        이미지 추가
                    </button>
                    <button type="button" className='ml-10 mt-2 border-2 border-black p-2' onClick={removeInputField}>
                        이미지 삭제 (뒤 부터)
                    </button>
                    <button type="button" className='ml-10 mt-2 border-2 border-black p-2' onClick={() => {
                        setPreviewUrl([]);
                        setPreviewName([]);
                        setNameFields([]);
                        setInputFields([]);
                    }}>
                        초기화
                    </button>
                </div>

                {previewurl.length !== 0 && (
                    <>
                        <div className=" border-2 border-black flex justify-center">
                        <Carousel withIndicators height={400}>
                            {previewurl.map((url, index) => (
                                <img key={index} src={url} className="w-1/2 h-1/2" />
                            ))}
                          </Carousel>
                                                
                            </div>
                        <div>
                            <button type="button" className='mt-2 border-2 border-black p-2' onClick={() => {
                              insertslider(previewurl, previewname);
                            close();
                            }}>
                                에디터에 추가
                            </button>
                        </div>
                    </>
                )}
            </Modal>

            <button
                type="button"
                className="relative cursor-pointer border border-black p-[10px] hover:bg-gray-200"
                onClick={open}>
                <img src={AddSlider} className="w-5 h-5" />
            </button>
        </>
    );
}
