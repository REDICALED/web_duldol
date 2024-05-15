import pic1 from "/images/Works/여린 것들의 슬픔/1.jpg";




import Zoom from "react-medium-image-zoom";



import Slick from '@/components/Slick';
const PostComponent7 = () => {


    return (
        <div className=" leading-5 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
            <div className='flex mb-[1vh] md:mb-[0.5vh]'>
                <Zoom>
                <img src={pic1} className=' md:w-[160px] w-[80px] h-[50px] md:h-[100px] object-cover'></img>
                </Zoom>
                <span className='w-full text-xxs md:text-xs'>여린 것들의 슬픔</span>
            </div>
            <Zoom>
            <img src={pic1} className="w-[100vw] md:h-[50vh] object-cover " ></img>
            </Zoom>
            <span>여린 것들의 슬픔_아크릴, 모래, 파스텔_97*130(cm)_2021</span>

            <span className=" justify-end flex text-right w-full ">
            꺾이고 잘리기 쉬운 것들.
            <br />
            <br />
            상처 입은 이들의 어두운 슬픔은
            밖으로 새어 나오기 마련이다.
            <br />
            <br />
            </span>
            <br />

        </div>
    );
}

export default PostComponent7;