import pic1 from "/images/Works/단단한 여자애의 소망/1.jpg";
import pic2 from "/images/Works/단단한 여자애의 소망/2.jpg";
import pic3 from "/images/Works/단단한 여자애의 소망/3.jpg";



import Zoom from "react-medium-image-zoom";



import Slick from '@/components/Slick';
const PostComponent2 = () => {


    return (
        <div className=" leading-5 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
            <div className='flex mb-[1vh] md:mb-[0.5vh]'>
                <Zoom>
                <img src={pic1} className=' md:w-[160px] w-[80px] h-[50px] md:h-[100px] object-cover'></img>
                </Zoom>
                <span className='w-full text-xxs md:text-xs'>단단한 여자애의 소망</span>
            </div>
    
            <Slick images={[pic1, pic2,pic3]} images_cap={["단단한 여자애의 소망(page1)_text file_a4_2022","단단한 여자애의 소망(page2)_text file_a4_2022","단단한 여자애의 소망(page3)_text file_a4_2022"]}/>

            <br />
            <br />

        </div>
    );
}

export default PostComponent2;