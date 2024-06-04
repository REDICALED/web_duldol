
import { PostGenreType } from '@/atoms/PostingAtom';
import '@/styles.scss'
import { useRecoilState } from 'recoil';
// import { Octokit } from "octokit";
// import { getFunc } from '@/components/Git/GitFunc';
import { useState } from 'react';
import Datepicker from "tailwind-datepicker-react"
import Resizer from "react-image-file-resizer";

 const SetTitleImage
  = (props:any) => {
    const [  , ] = useRecoilState(PostGenreType);
    const [ titlefile , setTitleFile] = useState<File | null>(null);
    const [show, setShow] = useState < boolean > (false);
	const [, setSelectedDate] = useState < Date | null > (null);
    const resizeTitleFile = (file: File): Promise<File>  =>
        new Promise((res) => {
          Resizer.imageFileResizer(
            file, // target file
            1000, // maxWidth
            1000, // maxHeight
            "JPEG", // compressFormat : Can be either JPEG, PNG or WEBP.
            60, // quality : 0 and 100. Used for the JPEG compression
            0, // rotation
            (uri) => res(uri as File), // responseUriFunc
            "file" // outputType : Can be either base64, blob or file.(Default type is base64)	
          );
        console.log("resizeFile");
        }
      );
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
		console.log(selectedDate.toISOString().split('T')[0])
    props.settiptapPostDate(selectedDate.toISOString().split('T')[0])
	}
	const handleClose = (state: boolean) => {
		setShow(state)
	}

    return (
        <>
      <div className=" border h-[10vh] border-dul-gray" >
        {titlefile !== null && <div className=" relative flex h-full flex-col items-center  justify-center overflow-hidden rounded-2xl bg-beige">
        <label 
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
        <img className=" h-full" src={URL.createObjectURL(titlefile)} alt="title"/>
            <input onChange={async (event)=>{
            if (event.target.files !== null){
                const file = await resizeTitleFile(event.target.files[0]);

                // Blob URL 가져오기
                const fileBlob = URL.createObjectURL(file);
                // Base64 데이터 가져오기
                const reader = new FileReader();
                reader.readAsDataURL(file)
                reader.onload = () => {
                    props.settiptapPostTitleImage({ blobUrl:fileBlob, base64:reader.result});
                }
                // setState 또는 다른 함수를 사용하여 상태 업데이트
                await setTitleFile(file);
                }
            }} className='hidden'  type="file" accept="image/*" />
        </label>
        </div> }  
        {titlefile === null && <div className="relative flex h-full flex-col items-center  justify-center overflow-hidden rounded-2xl bg-beige">
        <label 
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
            <span>타이틀 사진 업로드</span>
            <input onChange={async (event)=>{if (event.target.files !== null){
                const file = await resizeTitleFile(event.target.files[0]);

                // Blob URL 가져오기
                const fileBlob = URL.createObjectURL(file);
                // Base64 데이터 가져오기
                const reader = new FileReader();
                reader.readAsDataURL(file)
                reader.onload = () => {
                    props.settiptapPostTitleImage({ blobUrl:fileBlob, base64:reader.result});
                }
                // setState 또는 다른 함수를 사용하여 상태 업데이트
                await setTitleFile(file);
                }
            }} className='hidden'  type="file" accept="image/*" />
        </label>
        </div> }
    </div>
    <input onChange={(event)=>{ props.settiptapPostTitle(event.target.value)}} className='mt-2' type='text' placeholder='제목' />
    <Datepicker classNames=' pt-2' onChange={handleChange} show={show} setShow={handleClose} />

    </>
    );
  };
        
export default SetTitleImage
;