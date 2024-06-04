import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ParseHtml from "@/components/TipTap/ParseHtml";
import parse from 'html-react-parser';
import { useRecoilState } from "recoil";
import { ImageZoom } from "@/atoms/ModalAtom";

const PostNewPage = () => {
    const tags = useParams();
    const [htmlcontents, sethtmlcontents] = useState("");
    const [, setImageZoom] = useRecoilState(ImageZoom);
    const [titlename, settitlename] = useState("");

    useEffect(() => {
        getlist();
    }, []);

    const getlist =  async () => {
        await fetch(`/Posts/Works/${tags.id}/main.html`)
        .then(response => response.text())
        .then(html => {
          sethtmlcontents(html);
        })
        .catch(error => {
          console.error('Fetch error:', error);
        });
        await fetch(`/Posts/Works/${tags.id}/titlename.txt`)
        .then(response => response.text())
        .then(html => {
          settitlename(html.split('\n')[0]);
        })
        .catch(error => {
          console.error('Fetch error:', error);
        });
        
    }
    
    return (
        <div className=" leading-6 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
            <div className='flex mb-[1vh] md:mb-[0.5vh]'>
                    <img onClick={()=>{setImageZoom(`/Posts/Works/${tags.id}/title.JPEG`)}} src={`/Posts/Works/${tags.id}/title.JPEG`} className=' md:w-[160px] w-[80px] h-[50px] md:h-[100px] object-cover'></img>
                <span className='w-full text-xxs md:text-xs'>{titlename}</span>
            </div>
            {parse(htmlcontents, ParseHtml)}
        </div>
    );
};


export default PostNewPage;
