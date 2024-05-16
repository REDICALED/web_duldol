import { Link } from "react-router-dom";

const HomePage = () => {
    return (
    <div className=" text-dul-gray ml-[25vw] pl-10 mx-[15vw] xl:ml-[20vw] md:ml-[30vw] pt-[10vh] text-xs md:text-base ">
        
        <Link key={"metamorphosis"} to={'/Works/murmur-mural ensemble(웅얼웅얼-벽화 합창)'} className=''>
        <img className={ "w-full h-[10vh] md:h-[30vh]  object-cover"} src="/images/Home/Home1.jpg" alt='murmur-mural ensemble'></img>
        </Link>
        <br />
        <p className="">murmur-mural ensemble</p>

        <br />
        <Link key={"metamorphosis"} to={'/Works/metamorphosis'} className=''>
        <img className={ "w-full h-[10vh] md:h-[30vh]  object-cover"} src="/images/Home/Home2.jpg" alt='metamorphosis'></img>
        </Link>
        <br />
        <p className="">metamorphosis</p>
        
        <br />
        <Link key={"metamorphosis"} to={'/Works/미뢔(MIRWAE)'} className=''>
        <img className={ "w-full h-[10vh] md:h-[30vh]  object-cover"} src="/images/Home/Home3.jpg" alt='미뢔 MIRWAE'></img>
        <br />
        </Link>
        <p className="">미뢔 MIRWAE</p>
        
        <br />
        <Link key={"metamorphosis"} to={'/Works/중성인간(neutral%20person)'} className=''>
        <img className={ "w-full h-[10vh] md:h-[30vh]  object-cover"} src="/images/Home/Home4.jpeg" alt='중성인간 Neutral person'></img>
        </Link>
        <br />
        <p className="">중성인간 Neutral person</p>
        <br />
    </div>
    );
}

export default HomePage;

// murmur-mural ensemble
// Metamorphosis
// 미뢔 MIRWAE
// 중성인간 Neutral person
