
import { PostGenreType } from '@/atoms/PostingAtom';
import '@/styles.scss'
import { useRecoilState } from 'recoil';
import { Octokit } from "octokit";
import { getFunc } from '@/components/Git/GitFunc';

 const SetContents = (props:any) => {
    const [ GenreType , ] = useRecoilState(PostGenreType);

    const GetContents = async () => {
        const octokit = new Octokit({
          auth: import.meta.env.VITE_APP_TOKEN,
        });
      
        const puttitle = await getFunc(octokit, `Posts/${GenreType}.html`);
        let returnString = decodeURIComponent(escape(window.atob(puttitle.data.content)))
        console.log(puttitle.status);
        console.log(returnString);
        return returnString;
      };

    const handleButtonClick = async () => {
      console.log(GenreType);
      const ContentHtml = await GetContents();
      console.log(ContentHtml);
      props.tiptapeditor.commands.setContent(ContentHtml);
    }

    return (
      <div className=" ">
        <button onClick={handleButtonClick} className=' rounded-sm hover:bg-gray-100 transition-colors ml-[1vw] px-[1vw] py-[1vh] size-fit border border-black'> 불러오기 </button>  
      </div>
    );
  };
        
export default SetContents;