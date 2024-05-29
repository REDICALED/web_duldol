import '@/styles.scss'

import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'

import Strikethrough from '@/assets/icons/Strikethrough.png'
import H1 from '@/assets/icons/H1.png'
import H2 from '@/assets/icons/H2.png'
import H3 from '@/assets/icons/H3.png'
import Bold from '@/assets/icons/Bold.png'
import Italic from '@/assets/icons/Italic.png'
import Quote from '@/assets/icons/Quote.png'
import AddPhoto from '@/assets/icons/AddPhoto.png'
import AddSlider from '@/assets/icons/AddSlider.png'
import AddVideo from '@/assets/icons/AddVideo.png'
import Clear from '@/assets/icons/Clear.png'
import AlignCenter from '@/assets/icons/AlignCenter.png'
import AlignJustify from '@/assets/icons/AlignJustify.png'
import AlignLeft from '@/assets/icons/AlignLeft.png'
import AlignRight from '@/assets/icons/AlignRight.png'
import Paragraphimage from '@/assets/icons/Paragraph.png'
import Undo from '@/assets/icons/Undo.png'
import Redo from '@/assets/icons/Redo.png'
import Horizontal from '@/assets/icons/Horizontal.png'
import Preview from '@/components/TipTap/Preview'
import { tiptapMainText } from '@/atoms/TiptapAtom'

import { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import Resizer from "react-image-file-resizer";

const resizeFile = (file: File): Promise<File>  =>
    new Promise((res) => {
      Resizer.imageFileResizer(
        file, // target file
        1500, // maxWidth
        1500, // maxHeight
        "JPEG", // compressFormat : Can be either JPEG, PNG or WEBP.
        80, // quality : 0 and 100. Used for the JPEG compression
        0, // rotation
        (uri) => res(uri as File), // responseUriFunc
        "file" // outputType : Can be either base64, blob or file.(Default type is base64)	
      );
    console.log("resizeFile");
    }
  );

const MenuBar = () => {
  const { editor } = useCurrentEditor()
  const [  , setMainText] = useRecoilState(tiptapMainText);

  if (!editor) {
    return null
  }


  useEffect(() => {
    if (editor) {
      const onUpdate = () => {
        setMainText(editor.getHTML());
      };

      editor.on('update', onUpdate);

      return () => {
        editor.off('update', onUpdate);
      };
    }
  }, [editor]);

  const handleUploadPhoto = async (files: FileList | null) => {
    if (!files) {
      return;
    }
    const file = await resizeFile(files[0]);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result as string; // Cast the result to string
        editor.commands.setImage({ src: imageData }); // 이미지 삽입
        editor.commands.insertContent(`<div>${file.name}</div>`); // file이름
      };
      reader.readAsDataURL(file); // 파일을 base64로 변환
    }
  };

  const handleUploadSlick = async (files: FileList | null) => {
    if (!files) {
      return;
    }
  
    // FileList 객체를 배열로 변환
    const NameArray = Array.from(files).map(file => file.name);
    console.log("------------------------------------")
    console.log(files[0])
    const ImageArray = Array.from(files).map(file => URL.createObjectURL(file));
    const NameStr = NameArray.join(', ');
    const ImageStr = ImageArray.join(', ');

    editor.commands.insertContent(`------\n[슬라이더입니다!]\nimages=<<<${ImageStr}>>> images_cap=<<<${NameStr}>>>\n[!슬라이더입니다]\n------`);
};

const handleButtonClick = () => {
  const url = prompt('Please enter URL:');
  if (url) {
    console.log("url:", url)
    editor.commands.insertContent(`------\n[비디오입니다!]\nVideourl=<<<${url}>>>\n[!비디오입니다]\n------`);

  }
};


  return (
    <div className="">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .toggleBold()
            .run()
        }
        className={editor.isActive('bold') ? 'is-active' : 'is-none'}
      >
        <img src={Bold} className="w-5 h-5"/>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .toggleItalic()
            .run()
        }
        className={editor.isActive('italic') ? 'is-active' : 'is-none'}
      >
        <img src={Italic} className="w-5 h-5"/>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .toggleStrike()
            .run()
        }
        className={editor.isActive('strike') ? 'is-active' : 'is-none'}
      >
        <img src={Strikethrough} className="w-5 h-5"/>
      </button>
      
      <button onClick={() => editor.chain().focus().unsetAllMarks().run()} className="border border-black p-[10px] hover:bg-gray-200 ">
        <img src={Clear} className="w-5 h-5"/>
      </button>

      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editor.isActive('paragraph') ? 'is-active' : 'is-none'}
      >
        <img src={Paragraphimage} className="w-5 h-5"/>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : 'is-none'}
      >
        <img src={H1} className="w-5 h-5"/>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : 'is-none'}
      >
        <img src={H2} className="w-5 h-5"/>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'is-active' : 'is-none'}
      >
        <img src={H3} className="w-5 h-5"/>
      </button>
      
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : 'is-none'}
      >
        <img src={AlignLeft} className="w-5 h-5"/>
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : 'is-none'}
      >
        <img src={AlignCenter} className="w-5 h-5"/>
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : 'is-none'}
      >
        <img src={AlignRight} className="w-5 h-5"/>
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : 'is-none'}
      >
        <img src={AlignJustify} className="w-5 h-5"/>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : 'is-none'}
      >
        <img src={Quote} className="w-5 h-5"/>
      </button>

      <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="border border-black p-[10px] hover:bg-gray-200 ">
      <img src={Horizontal} className="w-5 h-5"/>
      </button>
      
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .undo()
            .run()
        }
        className="border border-black p-[10px] hover:bg-gray-200 ">
        <img src={Undo} className="w-5 h-5"/>
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .redo()
            .run()
        }
        className="border border-black p-[10px] hover:bg-gray-200 ">
        <img src={Redo} className="w-5 h-5"/>
      </button>

      <button
      type="button"
      className="relative cursor-pointer border border-black p-[10px] hover:bg-gray-200  "
    >
      <input
        type="file"
        className="absolute top-0 left-0 w-8 h-8 outline-none opacity-0 file:cursor-pointer"
        accept="image/*"
        onChange={(e) => {
          handleUploadPhoto(e.target.files);
        }}
      />
      <img src={AddPhoto} className="w-5 h-5"/>

    </button>

    <button
      type="button"
      className="relative cursor-pointer border border-black p-[10px] hover:bg-gray-200  "
    >
      <input
        type="file"
        className="absolute top-0 left-0 w-8 h-8 outline-none opacity-0 file:cursor-pointer"
        accept="image/*"
        onChange={(e) => {
          handleUploadSlick(e.target.files);
        }}
        multiple
      />
      <img src={AddSlider} className="w-5 h-5"/>

    </button>

    <button
      type="button"
      className="relative cursor-pointer border border-black p-[10px] hover:bg-gray-200 "
      onClick={handleButtonClick}
    >
      <img src={AddVideo} className="w-5 h-5"/>

    </button>

    </div>
  )
}

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
  }),
  Image.configure({ inline: true, allowBase64: true}),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
    defaultAlignment: 'left',
  }),
]


const Editor = () => {

  return (
    <div className=" flex pt-[5vh] pl-[10vw] w-[100vw]">
      <div>

      <EditorProvider slotBefore={<MenuBar />} extensions={extensions} content={''}></EditorProvider>

      </div>
 
      <div className=" ml-[1vw] preview w-[40vw] border-2 border-dul-gray h-[80vh] overflow-y-scroll">
          <div className=" leading-5 md:leading-6 w-[20vw] ml-[10vw]  text-dul-gray pt-[5vh] text-xxs md:text-xs"
          >
            <Preview/>
          </div>
      </div>
    </div>
  )
}

export default Editor; 