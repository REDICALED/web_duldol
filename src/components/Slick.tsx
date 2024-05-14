import { useState } from "react";
import Zoom from "react-medium-image-zoom";
import 'react-medium-image-zoom/dist/styles.css'

export const Slick = (props: { images: string[] }) => {
  const { images } = props;
  const [currentImage, setCurrentImage] = useState(0);
  console.log(images);
      
      return (
        <div className="  ">
          {images.map((imgurl, index) => (
              <div>
                <Zoom>
                  {<img className={ currentImage === index ? "opacity-100 block transition-all duration-300 w-[100vw] md:w-[60vw] " : "opacity-0 hidden pointer-events-none transition-all duration-300 w-[100vw] md:w-[60vw]"} src={imgurl} alt='asd'></img>}
                </Zoom>
            </div>
      ))}
      <div className=" text-sm md:text-base font-sans flex justify-between font-semibold" >
        <p>단단한 여자애의 소망</p>

      </div>
        <div className=" font-semibold pr-[1vw] w-full text-right justify-end md:space-x-10 space-x-5 flex text-dul-gray ">
          <div className=" right-0 text-sm md:text-3xl">
            <button className={ currentImage > 0 ? "opacity-100 " : "opacity-0 pointer-events-none "} onClick={()=>setCurrentImage(currentImage-1)}>&lt;</button>
          </div>
          <div className=" md:pt-1 right-0 text-sm md:text-2xl">
            {currentImage + 1}
          </div>
          <div className=" right-0 text-sm md:text-3xl">
            <button className={ currentImage < images.length - 1 ? "opacity-100 " : "opacity-0 pointer-events-none  "} onClick={()=>setCurrentImage(currentImage+1)}>&gt;</button>
          </div>
        </div>
        <br/>
        <br/>
        </div>
      );
  }

export default Slick;