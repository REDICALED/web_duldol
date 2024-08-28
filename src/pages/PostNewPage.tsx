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

      const tmpPosts = await fetch('/Posts.json')
      .then(response => response.json()) 
      .then(data => {
        // posts 배열 추출
        const posts: { title: string, year: number, hashdate: number }[] = data.posts;
          //console.log(posts);
          return posts;
        })
      .catch(error => console.error('Error fetching JSON:', error));
      let tmp = false;
      if (tmpPosts)
        {
          for(let i = 0; i < tmpPosts.length; i++) {
            if (tags.id === tmpPosts[i].hashdate.toString() ) {
              tmp = true;
              break;
            }
          }
        }
      if (tmp === false) {
        window.location.href = '/';
      }
        await fetch(`/Posts/Works/${tags.id}/main.html`)
        .then(response => response.text())
        .then(html => {
          sethtmlcontents(html);
        })
        .catch(error => {
          console.error('Fetch error:', error);
          window.location.href = '/';
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
                    <img onClick={()=>{setImageZoom(`/Posts/Works/${tags.id}/title.JPEG`)}} src={`/Posts/Works/${tags.id}/title.JPEG`} className=' cursor-zoom-in md:w-[100px] w-[60px] h-[60px] md:h-[100px] shrink-0  object-cover'></img>
                <span className='w-full text-xxs md:text-xs m-1'>{titlename}</span>
            </div>
            {parse(htmlcontents, {replace: (node) => ParseHtml.replace(node, setImageZoom)})}
            </div>
    );
};


export default PostNewPage;
