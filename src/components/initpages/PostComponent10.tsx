import pic1 from "/images/Works/thinking about pebble/1.jpg";
import pic2 from "/images/Works/thinking about pebble/2.jpg";
import pic3 from "/images/Works/thinking about pebble/3.jpg";
import gif1 from "/images/Works/thinking about pebble/1.gif";
import gif2 from "/images/Works/thinking about pebble/2.gif";
import Slick from '@/components/Slick';
import { useRecoilState } from "recoil";
import { ImageZoom } from "@/atoms/ModalAtom";

const PostComponent10 = () => {
    const [, setImageZoom] = useRecoilState(ImageZoom);


    return (
        <div className=" leading-4 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
        
            <div className='flex mb-[1vh] md:mb-[0.5vh]'>
                <img onClick={()=>{setImageZoom(pic2)}} src={pic2} className=' cursor-zoom-in md:w-[100px] w-[60px] h-[60px] md:h-[100px] shrink-0  object-cover'></img>
                <span className='w-full text-xxs md:text-xs m-1'>thinking about pebble</span>
            </div>
            <Slick images={[pic1, pic2, pic3]} images_cap={["돌멩이에 대해 생각해 thinking about pebble 1_digital print_2022","돌멩이에 대해 생각해 thinking about pebble 2_digital print_2022","돌멩이에 대해 생각해 thinking about pebble 3_digital print_2022"]}/>
            
            <span className=" justify-end flex text-right w-full ">
                맨들맨들한 표면에 단단한 돌멩이.
                <br />어렸을 때부터 돌멩이를 좋아했다. 돌멩이를 닮은 친구도 좋아했다.
                <br />
                <br />나도 친구들도 엄마아빠도 선생님들도 다른 어른들도
                <br />돌멩이같이, 
                <br />속은 단단하고 겉은 부드럽게, 
                <br />뾰족하거나 무거워서 찌르거나 누르지 않고, 
                <br />손에 꼭 쥐어지는 단단한 부드러움으로 괜한 오해나 미움 없이 순탄하게 흘러가길 바랐다. 모든 것이. 
                <br />사람들이, 세상이, 서로에게, 돌멩이처럼 씩씩하고 다정하면 좋겠다고 생각했다. 
            </span>
            <br />
            <img onClick={()=>{setImageZoom(gif1)}} src={gif1} className="w-[100vw] cursor-zoom-in" ></img>
            <span>돌멩이에 대해 생각해 thinking about pebble 4_digital gif_2022</span>
            <img onClick={()=>{setImageZoom(gif2)}} src={gif2} className="w-[100vw] cursor-zoom-in" ></img>
            <span>돌멩이에 대해 생각해 thinking about pebble 5_digital gif_2022</span>
            <br />
            <br />

        </div>

    );
}

export default PostComponent10;