import { useParams } from "react-router-dom";

const PostPage = () => {
    const tags = useParams();
    console.log(tags.id);
    return (
        <div className=" text-dul-gray mx-[5vw] xl:ml-[20vw] md:ml-[30vw] pt-[10vh] text-xl">

        <img className={ "w-[100vw] md:h-[50vh] object-cover"} src="/images/Home/Home1.jpg" alt='asd'></img>
        <br />
        
        <p className="">murmur-mural ensemble</p>
        <br />
        <img className={ "w-[100vw] md:h-[50vh] object-cover"} src="/images/Home/Home2.jpg" alt='asd'></img>
        <br />
        
        <p className="">Metamorphosis</p>
        <br />
        <img className={ "w-[100vw] md:h-[50vh] object-cover"} src="/images/Home/Home3.jpg" alt='asd'></img>
        <br />
        
        <p className="">미뢔 MIRWAE</p>
        <br />
        <img className={ "w-[100vw] md:h-[50vh] object-cover"} src="/images/Home/Home4.jpeg" alt='asd'></img>
        <br />
        
        <p className="">중성인간 Neutral person</p>
        <br />
        </div>
    );
}

export default PostPage;
