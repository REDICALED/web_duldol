import pic1 from "/images/Works/감정의 정반합/1.jpg";
import pic2 from "/images/Works/감정의 정반합/2.jpg";

import Slick from '@/components/Slick';
import { useRecoilState } from "recoil";
import { ImageZoom } from "@/atoms/ModalAtom";
const PostComponent1 = () => {
    const [, setImageZoom] = useRecoilState(ImageZoom);


    return (
        <div className=" leading-5 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
            <div className=' flex mb-[1vh] md:mb-[0.5vh]'>
                <img onClick={()=>{setImageZoom(pic1)}} src={pic1} className=' cursor-zoom-in md:w-[100px] w-[60px] h-[60px] md:h-[100px] shrink-0 '></img>
                <span className='w-full text-xxs md:text-xs m-1'>감정의 정반합</span>
            </div>

            
            
            <Slick images={[pic1, pic2]} images_cap={["감정의 정반합-회색 인간_뜯은 골판지 상자 한 쪽 면에 연필_54*78(cm)_2022", "감정의 정반합-회색 인간_부분도"]}/>
            <br />

        </div>
    );
}

export default PostComponent1;