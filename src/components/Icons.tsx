// src/icons.tsx
import React from 'react';
import { Editor } from '@tiptap/react';
import Strikethrough from '@/assets/icons/Strikethrough.png'
import H1 from '@/assets/icons/H1.png'
import H2 from '@/assets/icons/H2.png'
import H3 from '@/assets/icons/H3.png'
import Bold from '@/assets/icons/Bold.png'
import Code from '@/assets/icons/Code.png'
import Italic from '@/assets/icons/Italic.png'
import Quote from '@/assets/icons/Quote.png'
import AddPhoto from '@/assets/icons/AddPhoto.png'
import AddSlider from '@/assets/icons/AddSlider.png'
import AddVideo from '@/assets/icons/AddVideo.png'


interface IconButtonProps {
  editor: Editor;
  command: (editor: Editor) => void;
  iconSrc: string;
  alt: string;
}

const IconButton: React.FC<IconButtonProps> = ({ editor, command, iconSrc, alt }) => {
  const handleClick = () => {
    command(editor);
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 hover:bg-gray-200 rounded"
    >
      <img src={iconSrc} alt={alt} className="w-6 h-6" />
    </button>
  );
};

export const Icon = {
  H1: ({ editor }: { editor: Editor }) => (
    <IconButton
      editor={editor}
      command={(editor) => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      iconSrc={H1}
      alt="H1"
    />
  ),
  H2: ({ editor }: { editor: Editor }) => (
    <IconButton
      editor={editor}
      command={(editor) => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      iconSrc={H2}
      alt="H2"
    />
  ),
  H3: ({ editor }: { editor: Editor }) => (
    <IconButton
      editor={editor}
      command={(editor) => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      iconSrc={H3}
      alt="H3"
    />
  ),
  Bold: ({ editor }: { editor: Editor }) => (
    <IconButton
      editor={editor}
      command={(editor) => editor.chain().focus().toggleBold().run()}
      iconSrc={Bold}
      alt="Bold"
    />
  ),
  Italic: ({ editor }: { editor: Editor }) => (
    <IconButton
      editor={editor}
      command={(editor) => editor.chain().focus().toggleItalic().run()}
      iconSrc={Italic}
      alt="Italic"
    />
  ),
  Strikethrough: ({ editor }: { editor: Editor }) => (
    <IconButton
      editor={editor}
      command={(editor) => editor.chain().focus().toggleStrike().run()}
      iconSrc={Strikethrough}
      alt="Strikethrough"
    />
  ),
  Code: ({ editor }: { editor: Editor }) => (
    <IconButton
      editor={editor}
      command={(editor) => editor.chain().focus().toggleCode().run()}
      iconSrc={Code}
      alt="Code"
    />
  ),
  Quote: ({ editor }: { editor: Editor }) => (
    <IconButton
      editor={editor}
      command={(editor) => editor.chain().focus().toggleBlockquote().run()}
      iconSrc={Quote}
      alt="Quote"
    />
  ),
  AddPhoto: ({ editor }: { editor: Editor }) => (
    <IconButton
      editor={editor}
      command={(editor) => {
        const url = window.prompt('Enter the URL of the image:');
        if (url) editor.chain().focus().setImage({ src: url }).run();
      }}
      iconSrc={AddPhoto}
      alt="Add Photo"
    />
  ),
};
