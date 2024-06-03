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
// import Filelist from '@/components/TipTap/Filelist'

const Editor = () => {
  const [tiptapeditor, settiptapeditor] = useState(null);
  const [titapPostDate, settitapPostDate] = useState('');
  const [titapPostTitleImage, settitapPostTitleImage] = useState<null | File>(null);
  const [titapPostTitle, settitapPostTitle] = useState('');
  const [loginvalid] = useRecoilState(LoginValid);
  const [PreviewSwitch, setPreviewSwitch ] = useState(false);
  const [ GenreType , ] = useRecoilState(PostGenreType);

  const TipTapProps = {
    tiptapeditor: tiptapeditor,
    titapPostDate: titapPostDate,
    titapPostTitleImage: titapPostTitleImage,
    titapPostTitle: titapPostTitle,
    settitapPostDate: settitapPostDate,
    settitapPostTitleImage: settitapPostTitleImage,
    settitapPostTitle: settitapPostTitle,
    setPreviewSwitch: setPreviewSwitch,
    PreviewSwitch: PreviewSwitch,
    settiptapeditor: settiptapeditor,
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
        <EditorProvider slotBefore={<MenuBar settiptapeditor={settiptapeditor} PreviewSwitch={PreviewSwitch}/>} extensions={extensions} content={''}></EditorProvider>
        <div className='flex'>
        <UploadButton {... TipTapProps } />
        <UploadPreviewButton {... TipTapProps} />
        </div>

      </div>

      <div className={GenreType === "post" ? 'ml-[1vw] w-[43vw] pt-[30vh]' : 'ml-[1vw] w-[43vw] pt-[15vh]'}>
    <SetGenreButton {... TipTapProps}/>

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