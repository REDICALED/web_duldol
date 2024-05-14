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
                  {<img loading="lazy" className={ currentImage === index ? "opacity-100 block transition-all duration-300 w-[100vw] md:w-[60vw] h-[15vh] md:h-[40vh] object-cover " : " object-cover opacity-0 hidden pointer-events-none transition-all duration-300 w-[100vw] md:w-[60vw]"} src={imgurl} alt='asd'></img>}
                </Zoom>
                { currentImage === index && <div className=" text-xxs md:text-xs font-sans flex justify-between " >
                  <p>{props.images_cap[index]}</p>
                </div>}
            </div>
      ))}
        <div className=" pr-[1vw] w-full text-right justify-end md:space-x-10 space-x-5 flex text-dul-gray ">
          <div className=" right-0 text-xs md:text-sm">
            <button className={ currentImage > 0 ? "opacity-100 " : "opacity-0 pointer-events-none "} onClick={()=>setCurrentImage(currentImage-1)}>&lt;</button>
          </div>
          <div className="  right-0 text-xs md:text-sm">
            {currentImage + 1}
          </div>
          <div className=" right-0 text-xs md:text-sm">
            <button className={ currentImage < images.length - 1 ? "opacity-100 " : "opacity-0 pointer-events-none  "} onClick={()=>setCurrentImage(currentImage+1)}>&gt;</button>
          </div>
        </div>
        <br/>
        <br/>
        </div>
      );
  }

export default Slick;