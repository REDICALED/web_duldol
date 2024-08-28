import { ImageZoom } from "@/atoms/ModalAtom";
import pic1 from "/images/Works/유하다/1.jpg";
import pic2 from "/images/Works/유하다/2.jpg";
import pic3 from "/images/Works/유하다/3.jpg";
import pic4 from "/images/Works/유하다/4.jpg";

import Slick from '@/components/Slick';
import { useRecoilState } from "recoil";
const PostComponent8 = () => {
    const [, setImageZoom] = useRecoilState(ImageZoom);


    return (
        <div className=" leading-5 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
            <div className='flex mb-[1vh] md:mb-[0.5vh]'>
                <img onClick={()=>{setImageZoom(pic1)}} src={pic1} className=' md:w-[100px] w-[60px] h-[60px] md:h-[100px] shrink-0  object-cover'></img>
                <span className='w-full text-xxs md:text-xs m-1'>유하다</span>
            </div>
    
            <Slick images={[pic1, pic2,pic3]} images_cap={["유(柔)하다 1_아크릴, 파스텔_60.6*90.9(cm)_2021","유(柔)하다 2_아크릴물감, 파스텔_97*130.3(cm)_2021","유(柔)하다 4_아크릴물감, 파스텔_97*130.3(cm)_2021"]}/>
            <img onClick={()=>{setImageZoom(pic4)}} src={pic4} className="w-[100vw] object-cover " ></img>
            <span>유(有)하다_종이에 연필_47*64(cm)_2021</span>
            <br />
            <br />

        </div>
    );
}

export default PostComponent8;