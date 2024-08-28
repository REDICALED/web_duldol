import { useEffect, useState } from "react";
import ParseHtml from "@/components/TipTap/ParseHtml";
import parse from 'html-react-parser';
import { Navigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { LoginValid } from "@/atoms/LoginValidAtom";
import { ImageZoom } from "@/atoms/ModalAtom";

const MemoPage = () => {
  const [loginvalid] = useRecoilState(LoginValid);
  const [, setImageZoom] = useRecoilState(ImageZoom);

  if (loginvalid === 0) {
    return (
      <Navigate to="/login" />
    )
  }
  
    const [htmlcontents, sethtmlcontents] = useState("");
    useEffect(() => {
        inithtml();
        //console.log(htmlcontents);
    }, []);
    const inithtml =  async () => {
    
    await fetch('/Posts/memo.html')
    .then(response => response.text())
    .then(html => {
      // html 변수에 cv.html 파일의 내용이 문자열 형태로 저장됨
      //console.log(html);
      sethtmlcontents(html);
      // 여기서 필요한 처리를 수행할 수 있음
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
    }

    return (
        <div className=" leading-6 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
          {parse(htmlcontents, {replace: (node) => ParseHtml.replace(node, setImageZoom)})}
        </div>
    );
}

export default MemoPage;