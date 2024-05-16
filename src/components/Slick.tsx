import { useState } from "react";
import Zoom from "react-medium-image-zoom";
import 'react-medium-image-zoom/dist/styles.css'

export const Slick = (props: { images: string[], images_cap: string[] }) => {
  const { images } = props;
  const [currentImage, setCurrentImage] = useState(0);
  console.log(images);
      
      return (
        <div className=" md:pr-[0]  ">
          {images.map((imgurl, index) => (
              <div>
                <Zoom>
{<img 
  loading="lazy" 
  className={currentImage === index ? 
    "opacity-100 block transition-opacity duration-500 w-[100vw] md:w-[60vw] h-[15vh] md:h-[40vh] object-contain" 
    : "opacity-0 absolute w-[100vw] md:w-[60vw] h-0 object-contain pointer-events-none"
  } 
  src={imgurl} 
  alt='asd'
/>}
                </Zoom>
                { currentImage === index && <div className=" text-xxs md:text-xs font-sans flex justify-between " >
                  <p>{props.images_cap[index]}</p>
                </div>}
            </div>
      ))}
        <div className="w-full text-center justify-end flex text-dul-gray ">
          <span></span>
          <span className=" mx-4 right-0 text-xs md:text-sm font-semibold">{currentImage + 1}</span>
          <div className="flex">
            <div className=" mx-2  right-0 text-xs md:text-sm">
              <button className={ currentImage > 0 ? "opacity-100 " : "opacity-0 pointer-events-none "} onClick={()=>setCurrentImage(currentImage-1)}>&lt;</button>
            </div>
            <div className=" mx-2  right-0 text-xs md:text-sm">
              1 - {images.length}
            </div>
            <div className=" mx-2  right-0 text-xs md:text-sm">
              <button className={ currentImage < images.length - 1 ? "opacity-100 " : "opacity-0 pointer-events-none  "} onClick={()=>setCurrentImage(currentImage+1)}>&gt;</button>
            </div>
          </div>
        </div>
        <br/>
        <br/>
        </div>
      );
  }

export default Slick;