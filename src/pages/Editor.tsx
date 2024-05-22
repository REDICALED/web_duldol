import React, { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

declare global {
  interface Window {
    tinymce: any;
  }
}

const EditorPage: React.FC = () => {
  const [content, setContent] = useState<string>('**Hello world!!!**');
  const [savedContent, setSavedContent] = useState<string>('');

  const handleEditorChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleSave = () => {
    setSavedContent(content);
    console.log('Saved content:', content);
  };

  return (
    <div className="pt-[20vh] pl-[20vw] w-[80vw]">
      <Editor
        apiKey="s71qyh2vnte67fbqqxnyyfkdaauii23rah9asqm2m4snklsu"
        init={{
          plugins: 'save anchor autolink charmap codesample emoticons image link lists media searchreplace visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed linkchecker permanentpen powerpaste advtable advcode editimage advtemplate mentions tableofcontents footnotes mergetags autocorrect inlinecss markdown',
          toolbar: 'save undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
          save_onsavecallback: handleSave,
          file_picker_types: 'image',
          file_picker_callback: (cb) => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.onchange = function () {
              const file = (this as HTMLInputElement).files![0];
              const reader = new FileReader();
              reader.onload = function () {
                const id = 'blobid' + (new Date()).getTime();
                const blobCache = window.tinymce.activeEditor.editorUpload.blobCache;
                const base64 = (reader.result as string).split(',')[1];
                const blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);

                cb(blobInfo.blobUri(), { title: file.name });
              };
              reader.readAsDataURL(file);
            };
            input.click();
          },
        }}
        value={content}
        onEditorChange={handleEditorChange}
        initialValue="Welcome to TinyMCE!"
      />
      <button onClick={handleSave} className="mt-4 p-2 bg-blue-500 text-white rounded">
        Save
      </button>

      {savedContent && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2>Saved Content:</h2>
          <div dangerouslySetInnerHTML={{ __html: savedContent }} />
        </div>
      )}
    </div>
  );
};

export default EditorPage;
