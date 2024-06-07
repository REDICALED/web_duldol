import { tiptapMainText } from '@/atoms/TiptapAtom';
import { useRecoilState } from "recoil";
import parse from 'html-react-parser';
import Slick from '@/components/Slick';
import '@/styles.scss'
import { getJsonFunc } from '../Git/GitFunc';
import { Octokit } from 'octokit';
import { useState } from 'react';

const Postlist = (props: any) => {
  const [ MainText ] = useRecoilState(tiptapMainText);
  const [ PostList, setPostList ] = useState<any[]>([]);
  const getlist =  async () => {
    const octokit = new Octokit({
      auth: import.meta.env.VITE_APP_TOKEN,
    });
    const titleresult = await getJsonFunc(octokit, `Posts.json`);
    console.log(titleresult)
    setPostList(titleresult.posts);
  }

  return (
    <div className=" text-black">
      <button className='border-2 border-black h-[10vh] w-[10vw]' onClick={()=>{ getlist();}}>
      </button>
      { PostList && PostList.map((item: any, index: number) => (
        <div key={index} className=''>
          <div className=''>
            {item.title }
            {item.hashdate}
            { item.hashdate === 0 ?  <img src={`/images/Works/${item.title}/title.jpg`} /> : <img src={`/images/Works/${item.title}/${item.hashdate}/title.jpg`} />}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Postlist;
