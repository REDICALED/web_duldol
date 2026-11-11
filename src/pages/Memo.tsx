import { useEffect, useState } from "react";
import ParseHtml from "@/components/TipTap/ParseHtml";
import parse from 'html-react-parser';
import { Navigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { ImageZoom } from "@/atoms/ModalAtom";
import { ContentApiError, getAdminPage } from '@/lib/content-api';

const MemoPage = () => {
  const [, setImageZoom] = useRecoilState(ImageZoom);
  
    const [htmlcontents, sethtmlcontents] = useState("");
    const [error, setError] = useState('');
    const [unauthorized, setUnauthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        inithtml();
        //console.log(htmlcontents);
    }, []);
    const inithtml =  async () => {
    
    await getAdminPage('memo')
    .then(page => {
      // html 변수에 cv.html 파일의 내용이 문자열 형태로 저장됨
      //console.log(html);
      sethtmlcontents(page.content_html);
      // 여기서 필요한 처리를 수행할 수 있음
    })
    .catch(error => {
      if (error instanceof ContentApiError && error.status === 401) setUnauthorized(true);
      else setError(error instanceof Error ? error.message : '메모를 불러오지 못했습니다.');
    }).finally(() => setLoading(false));
    }

    if (unauthorized) return <Navigate to="/login" replace />;

    return (
        <div className=" mb-10 leading-6 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
          {loading && <p role="status">메모를 불러오는 중입니다.</p>}
          {error && <p role="alert">{error}</p>}
          {parse(htmlcontents, {replace: (node) => ParseHtml.replace(node, setImageZoom)})}
        </div>
    );
}

export default MemoPage;
