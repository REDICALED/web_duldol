
import { PostGenreType } from '@/atoms/PostingAtom';
import '@/styles.scss'
import { useRecoilState } from 'recoil';
import { Octokit } from "octokit";
import { getFunc } from '@/components/Git/GitFunc';
import { tiptapMainText } from '@/atoms/TiptapAtom';

 const SetContents = (props:any) => {
    const [ GenreType , ] = useRecoilState(PostGenreType);
    const [  , setMainText] = useRecoilState(tiptapMainText);


    const GetContents = async (props:any) => {
      const octokit = new Octokit({
        auth: import.meta.env.VITE_APP_TOKEN,
      });
    
      const puttitle = await getFunc(octokit, `Posts/${GenreType}.html`);
    
      if (puttitle.data.encoding === "base64") {
        let returnString = decodeURIComponent(escape(window.atob(puttitle.data.content)));
        await props.tiptapeditor.commands.setContent(returnString);
        await setMainText(returnString);
        return returnString;
      } else if (puttitle.data.encoding === "none") {
        const blobData = await octokit.request(puttitle.data.git_url);
        let returnString = decodeURIComponent(escape(window.atob(blobData.data.content)));
        await props.tiptapeditor.commands.setContent(returnString);
        await setMainText(returnString);
        return returnString;
      }
    };
    

    const handleButtonClick = async () => {
      await GetContents(props);
    }

    return (
      <div className=" ">
        <button onClick={handleButtonClick} className=' rounded-sm hover:bg-gray-100 transition-colors ml-[1vw] px-[1vw] py-[1vh] size-fit border border-black'> 불러오기 </button>  
      </div>
    );
  };
        
export default SetContents;