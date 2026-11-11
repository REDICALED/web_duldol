import { useEffect, useState } from "react";
import ParseHtml from "@/components/TipTap/ParseHtml";
import parse from 'html-react-parser';
import { useRecoilState } from "recoil";
import { ImageZoom } from "@/atoms/ModalAtom";
import { getPage } from '@/lib/content-api';

const CvPage = () => {
  const [, setImageZoom] = useRecoilState(ImageZoom);

    const [htmlcontents, sethtmlcontents] = useState("");
    const [error, setError] = useState('');
    useEffect(() => {
        inithtml();
        //console.log(htmlcontents);
    }, []);
    const inithtml =  async () => {
    
    await getPage('cv')
    .then(page => {
      // html 변수에 cv.html 파일의 내용이 문자열 형태로 저장됨
      //console.log(html);
      sethtmlcontents(page.content_html);
      // 여기서 필요한 처리를 수행할 수 있음
    })
    .catch(() => {
      setError('이력을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    });
    }

    return (
        <div className=" mb-10 leading-6 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
          {error && <p role="alert">{error}</p>}
          {parse(htmlcontents, {replace: (node) => ParseHtml.replace(node, setImageZoom)})}
      </div>
    );
}

export default CvPage;
