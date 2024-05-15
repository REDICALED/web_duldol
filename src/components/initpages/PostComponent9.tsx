import pic1 from "/images/Works/중성인간(neutral person)/1.jpg";
import pic2 from "/images/Works/중성인간(neutral person)/2.jpg";
import pic3 from "/images/Works/중성인간(neutral person)/3.jpg";
import pic4 from "/images/Works/중성인간(neutral person)/4.jpg";
import pic5 from "/images/Works/중성인간(neutral person)/5.jpg";
import pic6 from "/images/Works/중성인간(neutral person)/6.jpg";
import pic7 from "/images/Works/중성인간(neutral person)/7.jpg";
import pic8 from "/images/Works/중성인간(neutral person)/8.jpg";
import pic9 from "/images/Works/중성인간(neutral person)/9.jpg";
import pic10 from "/images/Works/중성인간(neutral person)/10.jpg";


import Zoom from "react-medium-image-zoom";



import Slick from '@/components/Slick';
const PostComponent9 = () => {
    const strings: string[] = Array.from({ length: 10 }, () => "중성인간 Neutral person_1 channel 2D animation_00:01:36_ 2022");


    return (
        <div className=" leading-5 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
            <div className='flex mb-[1vh] md:mb-[0.5vh]'>
                <Zoom>
                <img src={pic1} className=' md:w-[160px] w-[80px] h-[50px] md:h-[100px] object-cover'></img>
                </Zoom>
                <span className='w-full text-xxs md:text-xs'>중성인간 Neutral person</span>
            </div>

            <div className=" justify-start flex text-left w-full ">
                <iframe src="https://player.vimeo.com/video/782211457?autoplay=1&loop=1&title=0" className="w-full md:h-[550px]" ></iframe>
            </div>
            <div className='flex mb-[1vh] md:mb-[0.5vh]'>
                <span className='w-full text-xxs md:text-xs'>중성인간 Neutral person_1 channel 2D animation_00:01:36_ 2022
            </span>
            </div>
            <br />

            <span className=" justify-start flex text-left w-full ">
            &lt;중성인간&gt;은 전형적이고 정상적인 성지향•정체성 분류에서 자신을 찾지 못한 한 사람의 시적 서사와, 스스로를 닮았고 능가하는 중성인간과 그들의 사랑을 상상하며 이것이 실재화 되는 내용을 갖는다.
            <br />
            <br />
            이분법적 성별구별이 안되는 중성인간이라는 개념과 그들의 사랑을 상상적 실재로 두 눈 앞에 보여 사람들에게 이 존재와 이들의 사랑에 대한 당혹감, 궁금증, 관심을 갖게 하고 싶었다. 그 당혹감은 자신이 여성 혹은 남성 두 분류로, 또 이성애 중심적으로 세상을 바라보는 고정관념 속에 있음을 간접적으로 입증할 것이라고 생각했고, 자신의 테두리에서 벗어난 존재들에게 관심을 갖는 것이 존중의 범위를 넓히는 일의 시작이라고 보았기 때문이다.
            <br />
            <br />
            </span>
            <br />
            <span className=" justify-center flex text-center w-full ">
            낯선 무명 나무 위에서
            <br />
            <br />
            나는 나뭇잎 더미
            <br />
            <br />
            아래서
            <br />
            <br />
            생년월일이 다른 채의
            <br />
            <br />
            과거 내 꿈의 연인들을 보았다
            <br />
            <br />
            종이인형처럼 서 있어들
            <br />
            <br />
            나는 머리통을 두 세 네 개
            <br />
            <br />
            정도로 흔들었다
            <br />
            <br />
            천사는 꼬깃
            <br />
            <br />
            날개를 나무덤불에 꽂고
            <br />
            <br />
            떠났고
            <br />
            <br />
            뒤집힌 나무
            <br />
            <br />
            위 나의
            <br />
            <br />
            기원은 무엇
            <br />
            <br />
            벌레?
            <br />
            <br />
            까마귀?
            <br />
            <br />
            
            </span>
            <Slick images={[pic1, pic2, pic3, pic4, pic5, pic6, pic7, pic8, pic9, pic10]} images_cap={strings}/>
            <br />

        </div>
    );
}

export default PostComponent9;