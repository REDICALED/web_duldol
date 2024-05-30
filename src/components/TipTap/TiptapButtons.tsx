
import { PostGenreType } from '@/atoms/PostingAtom';
import '@/styles.scss'
import { useRecoilState } from 'recoil';
import SetContents from '@/components/TipTap/SetContents';
import { Octokit } from 'octokit';
import { tiptapMainText } from '@/atoms/TiptapAtom';
import { updateFunc } from '@/components/Git/GitFunc';
import { GitFileBlock } from '@/atoms/ModalAtom';

export const UploadButton = () => {
  const [ MainText ] = useRecoilState(tiptapMainText);
  const [ GenreType , ] = useRecoilState(PostGenreType);
    const [ ,SetGitFileBlock ] = useRecoilState(GitFileBlock);

    const uploadContents = async () => {
      const octokit = new Octokit({
        auth: import.meta.env.VITE_APP_TOKEN,
      });
      SetGitFileBlock(true);
      const puttitle = await updateFunc(octokit, `Posts/${GenreType}.html`, MainText, `${GenreType} updated`);
      SetGitFileBlock(false);
      console.log(puttitle.status);
    }
    return (
      <div className=" pb-[2vh] ">
        <button onClick={()=>{
        uploadContents();
        }} type="button" className=" transition-all duration-300 mt-[1vh] mr-[1vw] min-w-[19vw] max-w-[20vw] min-h-[10vh] max-h-[10vh] text-gray-900 bg-white hover:bg-gray-200 border-2 border-dul-gray focus:ring-4 focus:outline-none focus:ring-gray-100 rounded-lg text-center inline-flex items-center">
          <p className=" justify-center min-w-[15vw] max-w-[15vw] xs:min-w-[20vw] sm:min-w-[20vw] sm:text-l md:min-w-[20vw] md:text-xl lg:text-xl xl:text-3xl pr-[1vw]">업로드</p> 
        </button>        
        
        </div>
    );
  };
  export const SetGenreButton = (props:any) => {

    const [ GenreType , setGenreType] = useRecoilState(PostGenreType);
    return (
      <div className=" ">
        <label htmlFor="genre" className=" block text-l font-medium text-black">Uploading Type</label>
        <div className=" min-h-[8vh] max-h-[8vh] flex ">
          <select id="genre" 
          onChange={
            (e:any) => {
                setGenreType(e.target.value);
              }
          } 
          className=" min-h-[5vh] max-h-[5vh] bg-gray-50 border border-gray-300 text-gray-900 text-l rounded-lg focus:ring-blue-500 focus:border-blue-500 block  w-[30vw] ">
            <option value="memo">memo</option>
            <option value="cv">cv</option>
            <option value="contact">contact</option>
            <option value="note">note</option>
            <option value="post">post</option>
          </select>
          { GenreType !== "post" && <SetContents tiptapeditor={props.tiptapeditor}/>}
        </div>      
        </div>
    );
  };
  export const RemoveButton = () => {

    return (
      <div className=" ">
        <button> 글삭제 </button>
  
      </div>
    );
  };
  export const PostList = () => {

    return (
      <div className=" ">
        <button> 메인지정 </button>
  
      </div>
    );
  };
        