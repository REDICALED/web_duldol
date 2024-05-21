import { useParams } from "react-router-dom";
import { useState } from "react";
import { Editor } from '@tinymce/tinymce-react';

const EditorPage = () => {
        const [value, setValue] = useState("**Hello world!!!**");
        const tags = useParams();
        console.log(tags.id);
        return (
          <div className=" pt-[20vh] pl-[20vw] w-[80vw]">
            <Editor
            apiKey='s71qyh2vnte67fbqqxnyyfkdaauii23rah9asqm2m4snklsu'
            init={{
              plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed linkchecker a11ychecker tinymcespellchecker permanentpen powerpaste advtable advcode editimage advtemplate ai mentions tinycomments tableofcontents footnotes mergetags autocorrect typography inlinecss markdown',
              toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
              tinycomments_mode: 'embedded',
              tinycomments_author: 'Author name',
              mergetags_list: [
                { value: 'First.Name', title: 'First Name' },
                { value: 'Email', title: 'Email' },
              ],
              ai_request: (request: any, respondWith: { string: (arg0: () => Promise<never>) => any; }) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
            }}
            initialValue="Welcome to TinyMCE!"
          />
          </div>
        );
}

export default EditorPage;
