import { tiptapMainText } from '@/atoms/TiptapAtom';
import { useRecoilState } from "recoil";
import '@/styles.scss'
import { getFunc, getJsonFunc } from '../Git/GitFunc';
import { Octokit } from 'octokit';
import { useState } from 'react';
import hamburger from '@/assets/icons/hamburger.png'
import { fileDelete, fileMainImageSet } from '../Git/GitFileMod';
import { GitFileBlock } from '@/atoms/ModalAtom';

const Postlist = (props: any) => {
  const [ MainText, setMainText ] = useRecoilState(tiptapMainText);
  const [ PostList, setPostList ] = useState<any[]>([]);
  const [ PostListswitch, setPostListswitch ] = useState(false);
  const [, setFileBlock] = useRecoilState(GitFileBlock);

  const getlist =  async () => {
    setPostListswitch(!PostListswitch);
    const octokit = new Octokit({
      auth: import.meta.env.VITE_APP_TOKEN,
    });
    const titleresult = await getJsonFunc(octokit, `Posts.json`);
    const postsWithCheckbox = titleresult.posts.map((post: any) => ({
      ...post,
      selected: false
    }));
    console.log(postsWithCheckbox)
    setPostList(postsWithCheckbox);
    
  }

  const getPost = async (title: string, hashdate: number) => {
    const octokit = new Octokit({
      auth: import.meta.env.VITE_APP_TOKEN,
    });
    
    if(hashdate === 0) {
      title = encodeURIComponent(title);
      const puttitle = await getFunc(octokit, `images/Works/${title}/main.html`);
      let returnString = decodeURIComponent(escape(window.atob(puttitle.data.content)))
      await props.tiptapeditor.commands.setContent(returnString);
      await setMainText(returnString);
      return returnString;
    }
    else {
      // title = encodeURIComponent(title);
      // const puttitle = await getFunc(octokit, `Posts/Works/${hashdate.toString()}/main.html`);
      // console.log(title);
      // console.log(hashdate.toString());
      // console.log(puttitle);
      // let returnString = decodeURIComponent(escape(window.atob(puttitle.data.content)))
      // console.log(puttitle.status);
      // console.log(returnString);
      // const sliderPattern = /\[슬라이더입니다!\].*?\[!슬라이더입니다\]/gs;
      // returnString = returnString.replace(sliderPattern, '');
      // const imgTagPattern = /<img[^>]*>/g;
      // returnString = returnString.replace(imgTagPattern, '');
      // console.log(returnString);
      // await props.tiptapeditor.commands.setContent(returnString);
      
      // await setMainText(returnString);
      // console.log(MainText);
      // return returnString;

      title = encodeURIComponent(title);
      const url = `https://raw.githubusercontent.com/REDICALED/web_duldol/main/public/Posts/Works/${hashdate.toString()}/main.html`;

      try {
          // Fetch the HTML content from the raw GitHub URL
          const response = await fetch(url);
          if (!response.ok) {
              throw new Error('Failed to fetch the HTML content');
          }
          // Read the content as text
          let returnString = await response.text();
          
          const sliderPattern = /------ \[슬라이더입니다!\].*?\[!슬라이더입니다\] ------/gs;
          returnString = returnString.replace(sliderPattern, '');
          const imgTagPattern = /<img[^>]*>/g;
          returnString = returnString.replace(imgTagPattern, '');
          // Set the content in the editor
          await props.tiptapeditor.commands.setContent(returnString);

          // Update the state
          await setMainText(returnString);
          return returnString;

      } catch (error) {
          console.error('Error:', error);
      }
    }
  }

  return (
    <div className=" text-black mb-1">
      <button className=' border-black text-xxs flex place-items-center ' onClick={()=>{ getlist();}}>
        <img className=" w-10" src={hamburger}/> 게시물 불러오기
      </button>
      { PostListswitch && 
      <div className='pb-2'>
        <button onClick={()=>{
          let tmplist = [];
          for (let i = 0; i < PostList.length; i++) {
            if (PostList[i].selected) {
              tmplist.push(PostList[i]);
            }
          }
          fileDelete(`Posts/Works/`, tmplist, setFileBlock);
        setPostList([]);
      }}
      type="button" 
      className=" transition-all duration-300 mt-[1vh] mr-[1vw] min-w-[19vw] max-w-[20vw] min-h-[3vh] max-h-[3vh] text-gray-900 bg-white hover:bg-gray-200 border-2 border-dul-gray focus:ring-4 focus:outline-none focus:ring-gray-100 rounded-lg text-center inline-flex items-center">
        <p className=" justify-center min-w-[15vw] max-w-[15vw] xs:min-w-[20vw] sm:min-w-[20vw]  md:min-w-[20vw] text-md pr-[1vw]">삭제하기</p> 
      </button>
      <button onClick={async ()=>{
        let tmplist: string[] = [];
        for (let i = 0; i < PostList.length; i++) {
          if (PostList[i].selected) {
            if (PostList[i].hashdate === 0) {
              tmplist.push("0"+PostList[i].title);
            }
            else {
              tmplist.push(PostList[i].hashdate);
            }
          }
        }
        const mainset = await fileMainImageSet(`Posts`, tmplist, setFileBlock);
        setPostList([]);
      }} type="button" className=" transition-all duration-300 mt-[1vh] mr-[1vw] min-w-[19vw] max-w-[20vw] min-h-[3vh] max-h-[3vh] text-gray-900 bg-white hover:bg-gray-200 border-2 border-dul-gray focus:ring-4 focus:outline-none focus:ring-gray-100 rounded-lg text-center inline-flex items-center">
        <p className=" justify-center min-w-[15vw] max-w-[15vw] xs:min-w-[20vw] sm:min-w-[20vw]  md:min-w-[20vw] text-md pr-[1vw]">메인 이미지 설정</p> 
      </button>
      </div>
    }
    {/* list */}
      <div className={PostListswitch ? ' border-l border-r border-t border-black h-[30vh] overflow-y-scroll' : ' border-l border-r border-t border-black h-0 hidden'}>
      {PostList && PostList.sort((a, b) => a.year - b.year).reverse().map((item, index) => (
        
        <div className='flex border-b border-1 border-black'>
          <label className='w-1/2' key={index} htmlFor={item.title}>
        <div  className=' bg-white hover:bg-gray-200 transition-all duration-300' key={index}>
          <div className=' place-items-center text-xxs flex border-black'>
          { item.hashdate === 0 ?  <img className=' h-10 w-10' src={`/images/Works/${item.title}/title.jpg`} /> : <img className=' h-10 w-10' src={`/Posts/Works/${item.hashdate}/title.JPEG`} />}
            {item.title } /  
             {item.year}
             <input onChange={()=>{PostList[index].selected = !PostList[index].selected;}} className=" ml-1 peer w-3 h-3" type="checkbox" id={item.title} />
          </div>
        </div>
        </label>

        <button onClick={()=>{getPost(item.title, item.hashdate);}} className=' border my-1 bg-gray-100 text-xs pl-1 pr-1 border-black ml-10'>
          불러오기
        </button>
        </div>
      ))}
      </div>
    </div>
  );
};

export default Postlist;
