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
          <div className="fixed bottom-1/2 mb-[-1.25vh] md:mb-[-2.5vh] left-0 ">
              <img src={arrow_back} className={ currentImage > 0 ? "opacity-100 md:h-[5vh] h-[2.5vh]" : "opacity-0 pointer-events-none "} onClick={()=>setCurrentImage(currentImage-1)}></img>
            </div>

            <div className="fixed bottom-1/2 mb-[-1.25vh] md:mb-[-2.5vh] right-0 ">
              <img src={arrow_forward} className={ currentImage < images.length - 1 ? "opacity-100 md:h-[5vh] h-[2.5vh]" : "opacity-0 pointer-events-none  "} onClick={()=>setCurrentImage(currentImage+1)}></img>
            </div>
          </div>
        </div>
        <div className="fixed top-[5vh] md:top-[0vh] mb-[-1.25vh] md:mb-[-2.5vh] right-0 ">
              <img src={x_button} className={ "opacity-100 md:h-[5vh] h-[2.5vh]" } onClick={()=>setImageSlickZoom({SlickImages: [], index: 0})}></img>
        </div>

        </div>
      );
  }

export default ZoomSlick;