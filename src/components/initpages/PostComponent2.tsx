import pic1 from "/images/Works/단단한 여자애의 소망/1.jpg";
import pic2 from "/images/Works/단단한 여자애의 소망/2.jpg";
import pic3 from "/images/Works/단단한 여자애의 소망/3.jpg";

import Slick from '@/components/Slick';
import { useRecoilState } from "recoil";
import { ImageZoom } from "@/atoms/ModalAtom";
const PostComponent2 = () => {
    const [, setImageZoom] = useRecoilState(ImageZoom);


    return (
        <div className=" leading-5 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
            <div className='flex mb-[1vh] md:mb-[0.5vh]'>
                <img onClick={()=>{setImageZoom(pic1)}} src={pic1} className=' cursor-zoom-in md:w-[100px] w-[60px] h-[60px] md:h-[100px] shrink-0  object-cover'></img>
                <span className='w-full text-xxs md:text-xs m-1'>단단한 여자애의 소망</span>
            </div>
    
            <Slick images={[pic1, pic2,pic3]} images_cap={["단단한 여자애의 소망(page1)_text file_a4_2022","단단한 여자애의 소망(page2)_text file_a4_2022","단단한 여자애의 소망(page3)_text file_a4_2022"]}/>

            <br />
            <br />

        </div>
    );
}

export default PostComponent2;