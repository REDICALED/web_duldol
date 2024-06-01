import { ImageSlickZoom } from "@/atoms/ModalAtom";
import { useState } from "react";
import 'react-medium-image-zoom/dist/styles.css'
import { useRecoilState } from "recoil";
import arrow_back from '@/assets/icons/arrow_back.png'
import arrow_forward from '@/assets/icons/arrow_forward.png'
import x_button from '@/assets/icons/x_button.png'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export const ZoomSlick = (props: { images: string[], images_cap: string[] }) => {
  const { images } = props;
  const { images_cap } = props;
  const [, setImageSlickZoom] = useRecoilState(ImageSlickZoom);

  const [currentImage, setCurrentImage] = useState(0);
  console.log(images);
  console.log(images_cap);
      
      return (
        <div className=" md:pr-[0] w-full  ">
          {images.map((imgurl, index) => (
              <div className="grid place-items-center">
{<TransformWrapper>
      <TransformComponent>
    <img 
  loading="lazy" 
  className={currentImage === index ? 
    " opacity-100 block transition-opacity duration-500 w-full h-[90vh] object-contain" 
    : "opacity-0 absolute w-full h-[90vh] object-contain pointer-events-none"
  } 
  src={imgurl} 
  alt='asd'
/>
</TransformComponent>
    </TransformWrapper>
}
                { currentImage === index && <div className=" text-xxs md:text-xs font-sans flex justify-between " >
                  <p>{props.images_cap[index]}</p>
                </div>}
            </div>
      ))}
        <div className="w-full text-center justify-end flex text-white ">
          <span className=" mx-4 right-0 text-3xl font-semibold">{currentImage + 1}</span>
          <div className="flex">
          <div className="fixed bottom-0 left-0 flex justify-center items-center  mb-[50vh] md:mb-[45vh]">
              <img src={arrow_back} className={ currentImage > 0 ? "opacity-100 md:h-[20vh] h-[5vh]" : "opacity-0 pointer-events-none "} onClick={()=>setCurrentImage(currentImage-1)}></img>
            </div>
            <div className=" mx-2  right-0 text-3xl">
              1 - {images.length}
            </div>
            <div className="fixed bottom-0 right-0  flex justify-center items-center mb-[50vh] md:mb-[45vh]">
              <img src={arrow_forward} className={ currentImage < images.length - 1 ? "opacity-100 md:h-[20vh] h-[5vh]" : "opacity-0 pointer-events-none  "} onClick={()=>setCurrentImage(currentImage+1)}></img>
            </div>
          </div>
        </div>
        <div className="fixed top-0 right-0 flex justify-center items-center  mb-[50vh] md:mb-[45vh]">
              <img src={x_button} className={ "opacity-100 md:h-[15vh] h-[5vh]" } onClick={()=>setImageSlickZoom({SlickImages: [], index: 0})}></img>
        </div>

        </div>
      );
  }

export default ZoomSlick;