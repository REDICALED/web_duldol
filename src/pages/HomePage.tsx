import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
    const [titlelistState, settitlelistState] = useState<{title: string, year: string, hashdate: number}[]>([]);
    const getmainlist =  async () => {
        const titleresult = await fetch('/Posts.json')
        .then(response => response.json()) 
        .then(data => {
          // posts 배열 추출

          return data;
        })
        .catch(error => console.error('Error fetching JSON:', error));

        const mainlist = await fetch('/Posts/mainlist.txt')
        .then(response => response.text()) 
        .then(data => {
          // posts 배열 추출
          //console.log(data);
          return data;
        })
        .catch(error => console.error('Error fetching mainlist:', error));
        
        if(!mainlist){
            return;
        }
        //console.log(mainlist);
        const tmparray = [];
        for (let i = 0; i < titleresult.posts.length; i++) {
            if (mainlist.includes(titleresult.posts[i].title)) {
                //console.log(titleresult.posts[i]);
                tmparray.push(titleresult.posts[i]);
            }
            else{
                titleresult.posts.splice(i, 1);
            }
        }
        settitlelistState(tmparray);
        //console.log(titlelistState)    
    }
    useEffect(() => {
        getmainlist();
    },[]);
    return (
    <div className=" text-dul-gray ml-[25vw] pl-10 mx-[15vw] xl:ml-[20vw] md:ml-[30vw] pt-[10vh] text-xs md:text-base ">
        
        {/* <Link key={"metamorphosis"} to={'/Works/murmur-mural ensemble(웅얼웅얼-벽화 합창)'} className=''>
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
        <br /> */}
        <div  className="">
        {titlelistState && titlelistState.map((item, index) => {
            return (
                <div key={index} className="">
                    {item.hashdate === 0 ? <Link key={item.title} to={`/Works/${item.title}`} className=''> <img className={ "w-full h-[10vh] md:h-[30vh]  object-cover"} src={`/images/Works/${item.title}/title.jpg`} alt={item.title}></img>  </Link> : <Link key={item.title} to={`/Works/${item.hashdate}`} className=''> <img className={ "w-full h-[10vh] md:h-[30vh]  object-cover"} src={`/Posts/Works/${item.hashdate}/title.JPEG`} alt={item.title}></img> </Link> }
                    <br />
                    <p className="">{item.title}</p>
                    <br />
                </div>
            )
        })}
    </div>

    </div>
    );
}

export default HomePage;

// murmur-mural ensemble
// Metamorphosis
// 미뢔 MIRWAE
// 중성인간 Neutral person
