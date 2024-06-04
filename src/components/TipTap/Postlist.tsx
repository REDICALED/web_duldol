import { tiptapMainText } from '@/atoms/TiptapAtom';
import { useRecoilState } from "recoil";
import parse from 'html-react-parser';
import Slick from '@/components/Slick';
import '@/styles.scss'

const Postlist = (props: any) => {
  const [ MainText ] = useRecoilState(tiptapMainText);
  
  const getlist =  async () => {
    await fetch('/Posts/Works/titlelist.txt')
    .then(response => response.text())
    .then(titlestring => {
      // html 변수에 cv.html 파일의 내용이 문자열 형태로 저장됨
      console.log(titlestring);
      // 여기서 필요한 처리를 수행할 수 있음
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
    }

  return (
    <div className=" text-black">
        <button className='border-2 border-black h-[10vh] w-[10vw]' onClick={()=>{ getlist();}}>

        </button>
    </div>
  );
};

export default Postlist;
