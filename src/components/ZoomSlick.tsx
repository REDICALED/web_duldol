import { ImageSlickZoom } from "@/atoms/ModalAtom";
import { useState } from "react";
import 'react-medium-image-zoom/dist/styles.css'
import { useRecoilState } from "recoil";
import arrow_back from '@/assets/icons/arrow_l.png'
import arrow_forward from '@/assets/icons/arrow_r.png'
import x_button from '@/assets/icons/sign_x.png'
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
    " opacity-100 block transition-opacity duration-500 md:h-[90vh] h-[80vh] object-contain" 
    : "opacity-0 absolute w-full md:h-[90vh] h-[80vh] object-contain pointer-events-none"
  } 
  src={imgurl} 
  alt='asd'
/>
</TransformComponent>
    </TransformWrapper>
}

    </div>
      ))}
        <div className="w-full text-center justify-end flex text-white ">
          <div className="flex">
            
          <div  onClick={()=>{ if(currentImage > 0 )setCurrentImage(currentImage-1)}} className=" fixed bottom-[20vh] md:w-[10vw] w-[15vw] left-0 h-[60vh]">
            <img src={arrow_back} className={ currentImage > 0 ? " fixed bottom-1/2 mb-[-1.25vh] md:mb-[-1.5vh] left-0 opacity-100 md:h-[3vh] h-[2.5vh]" : "fixed bottom-1/2 mb-[-1.25vh] md:mb-[-2.5vh] left-0 opacity-0 pointer-events-none  "}></img>
            </div>

            <div onClick={()=>{ if(currentImage < images.length - 1)setCurrentImage(currentImage+1)}} className=" fixed bottom-[20vh] md:w-[10vw] w-[15vw] right-0 h-[60vh]">
              <img src={arrow_forward} className={ currentImage < images.length - 1 ? " fixed bottom-1/2 mb-[-1.25vh] md:mb-[-1.5vh] right-0 opacity-100 md:h-[3vh] h-[2.5vh]" : "fixed bottom-1/2 mb-[-1.25vh] md:mb-[-2.5vh] right-0 opacity-0 pointer-events-none  "}></img>
            </div>

          </div>
        </div>
        <div onClick={()=>setImageSlickZoom({SlickImages: [], index: 0})} className=" fixed top-[5vh] md:top-[0vh] mb-[-2.5vh] md:mb-[-3vh] right-0 md:h-[6vh] h-[5vh] md:w-[5vw] w-[10vw] ">
              <img src={x_button} className={ " fixed top-[5vh] md:top-[0vh] mb-[-1.25vh] md:mb-[-1.5vh] right-0 opacity-100 md:h-[3vh] h-[2.5vh]" } ></img>
        </div>

        </div>
      );
  }

export default ZoomSlick;