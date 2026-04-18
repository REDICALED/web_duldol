import pic1 from "/images/Works/신원계 新圓界 - 파고착조 破觚斲雕_/1.jpg";
import pic2 from "/images/Works/신원계 新圓界 - 파고착조 破觚斲雕_/2.jpg";
import pic3 from "/images/Works/신원계 新圓界 - 파고착조 破觚斲雕_/3.jpg";
import pic4 from "/images/Works/신원계 新圓界 - 파고착조 破觚斲雕_/4.jpg";
import pic5 from "/images/Works/신원계 新圓界 - 파고착조 破觚斲雕_/5.jpg";
import pic6 from "/images/Works/신원계 新圓界 - 파고착조 破觚斲雕_/6.jpg";
import pic7 from "/images/Works/신원계 新圓界 - 파고착조 破觚斲雕_/7.jpg";
import pic8 from "/images/Works/신원계 新圓界 - 파고착조 破觚斲雕_/8.jpg";
import pic9 from "/images/Works/신원계 新圓界 - 파고착조 破觚斲雕_/9.jpg";
import pic10 from "/images/Works/신원계 新圓界 - 파고착조 破觚斲雕_/10.jpg";
import pic11 from "/images/Works/신원계 新圓界 - 파고착조 破觚斲雕_/11.jpg";
import pic12 from "/images/Works/신원계 新圓界 - 파고착조 破觚斲雕_/12.jpg";
import pic13 from "/images/Works/신원계 新圓界 - 파고착조 破觚斲雕_/13.jpg";
import pic14 from "/images/Works/신원계 新圓界 - 파고착조 破觚斲雕_/14.jpg";
import title from "/images/Works/신원계 新圓界 - 파고착조 破觚斲雕_/title.jpg";

import Slick from '@/components/Slick';
import { useRecoilState } from "recoil";
import { ImageZoom } from "@/atoms/ModalAtom";

const PostComponent6 = () => {
    const strings: string[] = Array.from({ length: 14 }, () => "신원계 新圓界 – 파고착조 破觚斲雕_2D animation, still cut_00:01:06_2022    ");
    const [, setImageZoom] = useRecoilState(ImageZoom);

    return (
        <div className=" leading-4 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
            <div className='flex mb-[1vh] md:mb-[0.5vh]'>
                <img onClick={()=>{setImageZoom(title)}} src={title} className=' cursor-zoom-in md:w-[100px] w-[60px] h-[60px] md:h-[100px] shrink-0  object-cover'></img>
                <span className='w-full text-xxs md:text-xs m-1'>신원계 新圓界 - 파고착조 破觚斲雕</span>
            </div>

            <div className=" justify-start flex text-left w-full ">
                <iframe src="https://player.vimeo.com/video/782210999?autoplay=0" className="w-full md:h-[450px] h-[130px]" ></iframe>
            </div>
            <div className='flex mb-[1vh] md:mb-[0.5vh]'>
                <span className='w-full text-xxs md:text-xs m-1'>신원계 新圓界 – 파고착조 破觚斲雕_2D animation_00:01:06_2022
                </span>
            </div>

            <br />
            <span className=" justify-start flex text-left w-full ">
            새로운 둥근 세계, 모서리를 깨트려 둥글게 하고 복잡한 것을 간단히 한다. 
            <br />
            <br />

            살다 보면 세계의 뾰족뾰족 모난 부분들을 마주한다.
            <br />
            날카로운 사건의 모서리를 깨트려 둥글게 하고, 복잡한 것을 간단히 한 세계를 상상해본다.
            <br />
            <br />

            올드미디어인 연필 드로잉을 촬영해, 디지털 환경에서 조합하여 동영상으로 제작했다. 그 과정에서 드로잉은 원본의 고유성을 잃고 추상적인 코드들의 집합, 디지털적 복제품으로 바뀐다. 편집프로그램 도구를 통한 조작으로 드로잉의 형상은 늘려지고, 복제되고, 잘려 확대 축소되며, 의도에 맞는 화면의 일부가 되기 위해 다듬어져 간다. 이는 현실과 거리가 먼, 한 인간의 욕구에 의해 설계된 이상적인 세계의 속성과도 맞닿는다.
            <br />
            <br />

            제작된 영상은 물질적 실재 없이 쉽게 환경을 바꿔가며 이동하고 변형될 수 있는 디지털 매체의 특성을 띤다. 나는 여러 웹사이트에 다른 버전으로 복제 변형하여 작업을 업로드했다. 이렇듯 동시점에 여러 개 버전으로 여러 웹에 존재하는 신원계는 인류가 발 딛고 살고 있는 유일성을 갖는 지구세계와 같을 수 없이 다르기에 이상성을, 닿을 수 없는 짝사랑의 성격을 보이는 듯하다.

            </span>


            <br />
            <Slick images={[pic1, pic2, pic3, pic4, pic5, pic6, pic7, pic8, pic9, pic10, pic11, pic12, pic13, pic14]} images_cap={strings}/>


        </div>
    );
}

export default PostComponent6;