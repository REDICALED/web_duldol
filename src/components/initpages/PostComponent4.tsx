import pic1 from "/images/Works/모양들(shapes)/1.jpeg";
import pic2 from "/images/Works/모양들(shapes)/2.jpg";
import pic3 from "/images/Works/모양들(shapes)/3.jpg";
import pic4 from "/images/Works/모양들(shapes)/4.jpg";

import Slick from '@/components/Slick';
import { useRecoilState } from "recoil";
import { ImageZoom } from "@/atoms/ModalAtom";
const PostComponent4 = () => {
    const [, setImageZoom] = useRecoilState(ImageZoom);

    return (
        <div className=" leading-5 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
            <div className='flex mb-[1vh] md:mb-[0.5vh]'>
                <img onClick={()=>{setImageZoom(pic1)}} src={pic1} className=' cursor-zoom-in md:w-[100px] w-[60px] h-[60px] md:h-[100px] shrink-0  object-cover'></img>
                <span className='w-full text-xxs md:text-xs m-1'>모양들 shapes</span>
            </div>

            
            
            <Slick images={[pic1, pic2,pic3,pic4]} images_cap={["모양들 1_드라이 포인트_25*35(cm)_2021","모양들 2_스크린판화_45*62(cm)_2021","모양들 3_스크린판화_45*62(cm)_2021","모양들 4_스크린판화_45*62(cm)_2021"]}/>
            <span className='w-full justify-center flex text-center text-xxs md:text-xs'>모양들, 내 속을 떠다니는 모양들.</span>

        </div>
    );
}

export default PostComponent4;