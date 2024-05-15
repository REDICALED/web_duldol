import pic1 from "/images/Works/돌계란(stonegg)/1.jpg";
import pic2 from "/images/Works/돌계란(stonegg)/2.jpg";
import pic3 from "/images/Works/돌계란(stonegg)/3.jpg";
import pic4 from "/images/Works/돌계란(stonegg)/4.jpg";
import Slick from '@/components/Slick';
import Zoom from "react-medium-image-zoom";


const PostComponent3 = () => {
    return (
        <div className=" leading-4 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
        
            <div className='flex mb-[1vh] md:mb-[0.5vh]'>
            <Zoom>
                <img src={pic2} className=' md:w-[160px] w-[80px] h-[50px] md:h-[100px] object-cover'></img>
            </Zoom>

                <span className='w-full text-xxs md:text-xs'>돌계란 stonegg</span>
            </div>
            <Zoom>
            <img src={pic2} className="w-[100vw] md:h-[50vh] object-cover " ></img>
            </Zoom>
            <span>돌계란 2_21*28(cm)_혼합재료_2022</span>
            <br />
            <br />
            <span className=" justify-start flex text-left w-full ">
            일상에 소음이 참 많다.
            <br />
            분노, 걱정, 떨림, 외로움 등 존재들을 편하게 두지 않는 시끄러운 감정과 상황이 이 세상에 참 많다.
            <br />
            <br />
            이 세계와 그 속 나의 모습을 가만히 들여다 볼 때면 모두 부딪히고 깨진 달걀 조각들 같다.
            <br />
            곳곳에 흐트러져 놓여있는 조각난 껍질들을 모은다. 다듬고 본드로 단단하게 뭉쳐 붙인다.
            <br />
            그렇게 깨지기 이전보다 단단해진 돌계란을 만든다.

            </span>
            <br />

            <div className="flex text-right justify-end">
            <Zoom>
                <img src={pic1} className="md:h-[50vh] ml-auto " ></img>
            </Zoom>
            </div>
            <span className="text-right justify-end flex">돌계란 1_25*31(cm)_종이에 연필_2022</span>

            <br />
            <Slick images={[pic3, pic4]} images_cap={["돌계란 3_20*25(cm)_혼합재료_2022 / sketch","돌계란 4_20*25(cm)_혼합재료_2022 / sketch"]}/>

        </div>
    );
}

export default PostComponent3;