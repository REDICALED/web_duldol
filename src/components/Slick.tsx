import { ImageSlickZoom } from "@/atoms/ModalAtom";
import { useState } from "react";
import 'react-medium-image-zoom/dist/styles.css'
import { useRecoilState } from "recoil";

export const Slick = (props: { images: string[], images_cap: string[] }) => {
  const { images } = props;
  const [, setImageSlickZoom] = useRecoilState(ImageSlickZoom);

  const [currentImage, setCurrentImage] = useState(0);
      
      return (
        <div className=" md:pr-[0]  ">
          {images.map((imgurl, index) => (
              <div key={ index }>
{<img 
  loading="lazy"
  referrerPolicy="no-referrer"
  className={currentImage === index ? 
    "opacity-100 block transition-opacity duration-500 w-[100vw] md:w-[60vw]  object-contain cursor-zoom-in" 
    : "opacity-0 absolute w-[100vw] md:w-[60vw] h-0 object-contain pointer-events-none cursor-zoom-in"
  } 
  src={imgurl} 
  alt='이미지가 로드되지 않았습니다'
  onClick={()=>{setImageSlickZoom({SlickImages: images, index: 0})}}
/>}
                { currentImage === index && <div className=" text-xxs md:text-xs font-sans flex justify-between " >
                  <p>{props.images_cap[index].replace(".JPEG", "")}</p>
                </div>}
            </div>
      ))}
        <div className="w-full text-center justify-end flex text-dul-gray ">
          <span></span>
          <span className=" mx-4 right-0 text-xs md:text-sm font-semibold">{currentImage + 1}</span>
          <div className="flex">
            <div className=" mx-2  right-0 text-xs md:text-sm">
              <button className={ currentImage > 0 ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none "} onClick={()=>setCurrentImage(currentImage-1)}>&lt;</button>
            </div>
            <div className=" mx-2  right-0 text-xs md:text-sm">
              1 - {images.length}
            </div>
            <div className=" mx-2  right-0 text-xs md:text-sm">
              <button className={ currentImage < images.length - 1 ? "opacity-100 cursor-pointer " : "opacity-0 pointer-events-none "} onClick={()=>setCurrentImage(currentImage+1)}>&gt;</button>
            </div>
          </div>
        </div>
        <br/>
        <br/>
        </div>
      );
  }

export default Slick;