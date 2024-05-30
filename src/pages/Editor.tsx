import '@/styles.scss'

import { EditorProvider } from '@tiptap/react'
import { LoginValid } from '@/atoms/LoginValidAtom'
import Preview from '@/components/TipTap/Preview'
import MenuBar from '@/components/TipTap/MenuBar'
import extensions from '@/components/TipTap/Extensions'
import { UploadButton, SetGenreButton, RemoveButton, PostList } from '@/components/TipTap/TiptapButtons'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useRecoilState } from 'recoil'

const Editor = () => {
  const [tiptapeditor, settiptapeditor] = useState(null);
  const [loginvalid] = useRecoilState(LoginValid);
  if (loginvalid === 0) {
    return (
      <Navigate to="/login" />
    )
  }

  return (
    <div className=" flex pt-[5vh] pl-[1vw] w-[100vw]">
      <div className=' space-y-[1vh]'>
        <SetGenreButton tiptapeditor={tiptapeditor}/>
        <EditorProvider slotBefore={<MenuBar settiptapeditor={settiptapeditor} />} extensions={extensions} content={''}></EditorProvider>
        <UploadButton/>
      </div>
 
      <div className=" ml-[1vw] preview w-[43vw] border-2 border-dul-gray h-[80vh] overflow-y-scroll">
          <div className=" leading-5 md:leading-6 w-[40vw] mx-[1vw]  text-dul-gray pt-[5vh] text-xxs md:text-xs"
          >
            <Preview/>
          </div>
      </div>
    </div>
  )
}

export default Editor; 