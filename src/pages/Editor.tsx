import '@/styles.scss'

import { EditorProvider } from '@tiptap/react'
import { LoginValid } from '@/atoms/LoginValidAtom'
import Preview from '@/components/TipTap/Preview'
import MenuBar from '@/components/TipTap/MenuBar'
import extensions from '@/components/TipTap/Extensions'
import { UploadButton, SetGenreButton, UploadPreviewButton } from '@/components/TipTap/TiptapButtons'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { PostGenreType } from '@/atoms/PostingAtom'
import Postlist from '@/components/TipTap/Postlist'
// import Filelist from '@/components/TipTap/Filelist'

const Editor = () => {
  const [tiptapeditor, settiptapeditor] = useState(null);
  const [tiptapPostDate, settiptapPostDate] = useState('');
  const [tiptapPostTitleImage, settiptapPostTitleImage] = useState<{ blobUrl: string; base64: string; }>({
    blobUrl: '',
    base64: '',
  });
  const [tiptapPostSliderStack, settiptapPostSliderStack] = useState<{ blobUrl: string[]; base64: string[]; ImageName: string[]; }[]>([]);
  const [tiptapPostTitle, settiptapPostTitle] = useState('');
  const [loginvalid] = useRecoilState(LoginValid);
  const [PreviewSwitch, setPreviewSwitch ] = useState(false);
  const [ GenreType , ] = useRecoilState(PostGenreType);

  const TipTapProps = {
    tiptapeditor: tiptapeditor,
    tiptapPostDate: tiptapPostDate,
    tiptapPostTitleImage: tiptapPostTitleImage,
    tiptapPostTitle: tiptapPostTitle,
    settiptapPostDate: settiptapPostDate,
    settiptapPostTitleImage: settiptapPostTitleImage,
    settiptapPostTitle: settiptapPostTitle,
    setPreviewSwitch: setPreviewSwitch,
    PreviewSwitch: PreviewSwitch,
    settiptapeditor: settiptapeditor,
    GenreType: GenreType,
    settiptapPostSliderStack: settiptapPostSliderStack,
    tiptapPostSliderStack: tiptapPostSliderStack,
  };

  if (loginvalid === 0) {
    return (
      <Navigate to="/login" />
    )
  }

  return (
    <div className=" flex pt-[1vh] pl-[1vw] w-[100vw]">
      <div className=' space-y-[1vh]'>
        <SetGenreButton {... TipTapProps}/>
        <EditorProvider slotBefore={<MenuBar {... TipTapProps}/>} extensions={extensions} content={''}></EditorProvider>
        <div className='flex'>
        <UploadButton {... TipTapProps } />
        <UploadPreviewButton {... TipTapProps} />
        </div>

      </div>

      <div className={GenreType === "post" ? 'ml-[1vw] w-[43vw] pt-[0vh]' : 'ml-[1vw] w-[43vw] pt-[15vh]'}>
    <Postlist {... TipTapProps}/>

      <div className=" preview border-2 border-dul-gray h-[80vh] overflow-y-scroll overflow-x-auto ">
          <div className=" leading-5 md:leading-6 w-[40vw] mx-[1vw]  text-dul-gray pt-[3vh] text-xxs md:text-xs"
          >
            <Preview/>
          </div>

      </div>

      </div>
      
    </div>
  )
}

export default Editor; 