import { useParams } from "react-router-dom";
import MDEditor from '@uiw/react-md-editor'
import { useState } from "react";

const Editor = () => {
        const [value, setValue] = useState("**Hello world!!!**");
        const tags = useParams();
        console.log(tags.id);
        return (
                <div className="container pt-[30vh]">
            <MDEditor
                value={value}
                onChange={(value = '', event) => setValue(value)}
            />
            <MDEditor.Markdown source={value} style={{ whiteSpace: 'pre-wrap' }} />
        </div>
        );
}

export default Editor;
