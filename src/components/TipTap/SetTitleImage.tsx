
import { PostGenreType } from '@/atoms/PostingAtom';
import '@/styles.scss'
import { useRecoilState } from 'recoil';
// import { Octokit } from "octokit";
// import { getFunc } from '@/components/Git/GitFunc';
import { useState } from 'react';
import Datepicker from "tailwind-datepicker-react"

 const SetTitleImage
  = (props:any) => {
    const [  , ] = useRecoilState(PostGenreType);
    const [ titlefile , setTitleFile] = useState<string>("");
    const [show, setShow] = useState < boolean > (false);
	const [, setSelectedDate] = useState < Date | null > (null);
    // const GetContents = async () => {
    //     const octokit = new Octokit({
    //       auth: import.meta.env.VITE_APP_TOKEN,
    //     });
      
    //     const puttitle = await getFunc(octokit, `Posts/${GenreType}.html`);
    //     let returnString = decodeURIComponent(escape(window.atob(puttitle.data.content)))
    //     console.log(puttitle.status);
    //     return returnString;
    //   };

    // const handleButtonClick = async () => {
    //   const ContentHtml = await GetContents();
    //   props.tiptapeditor.commands.setContent(ContentHtml);
    // }

    const handleChange = (selectedDate: Date) => {
		setSelectedDate(selectedDate)
    props.settiptapPostDate(selectedDate.toISOString().split('T')[0])
	}
	const handleClose = (state: boolean) => {
		setShow(state)
	}
    const parse_image_id = (url: string) => {
        const match = url.match(/\/d\/(.*?)\//);
        const fileId = match ? match[1] : '';
        return `https://lh3.googleusercontent.com/d/${fileId}`;
      }
    
    return (
        <>
      <div className=" mb-2" >
        <div className="relative h-full overflow-hidden">
            {/* <input onChange={async (event)=>{if (event.target.files !== null){
                const file = await event.target.files[0];

                // Blob URL 가져오기
                const fileBlob = URL.createObjectURL(file);
                // Base64 데이터 가져오기
                const reader = new FileReader();
                reader.readAsDataURL(file)
                reader.onload = () => {
                    props.settiptapPostTitleImage({ blobUrl:fileBlob});
                }
                // setState 또는 다른 함수를 사용하여 상태 업데이트
                await setTitleFile(file);
                }
            }} className='hidden'  type="text" accept="image/*" /> */}
            <div>
                타이틀 이미지
            </div>
            <div className='flex'>
            <input 
            onChange={(event)=>{ setTitleFile(event.target.value); }}
            placeholder='타이틀 이미지 링크' className=' pl-2 border-[1px] border-dul-gray w-1/2 '>
            </input>
            <button
            onClick={()=>{
                console.log(props.tiptapPostTitleImage)
                props.settiptapPostTitleImage({ blobUrl:parse_image_id(titlefile)});
            }
            }
            className='ml-2 border-2 border-dul-gray p-1'>
                등록
            </button>

            
            </div>

            {props.tiptapPostTitleImage.blobUrl && <div className=' my-2'>
                <img src={props.tiptapPostTitleImage.blobUrl}></img>
            </div>}
        </div>
    </div>
    <input onChange={(event)=>{ props.settiptapPostTitle(event.target.value)}} className='mt-2' type='text' placeholder='제목' />
    <Datepicker classNames=' pt-2' onChange={handleChange} show={show} setShow={handleClose} />

    </>
    );
  };
        
export default SetTitleImage
;