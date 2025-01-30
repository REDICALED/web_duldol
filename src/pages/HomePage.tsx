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

        //console.log(mainlist);
        const tmparray = titleresult.posts.sort((a: { year: string | number | Date; }, b: { year: string | number | Date; }) => {
            const dateA = new Date(a.year).getTime();
            const dateB = new Date(b.year).getTime();
            return dateB - dateA; // 최신순 정렬
          });
        const latestThree = tmparray.slice(0, 3);
        console.log(latestThree);
        settitlelistState(latestThree);
        //console.log(titlelistState)    
    }
    useEffect(() => {
        getmainlist();
    },[]);
    return (
    <div className=" text-dul-gray ml-[25vw] pl-10 mx-[15vw] xl:ml-[20vw] md:ml-[30vw] pt-[10vh] text-xs md:text-base ">
        <div className=" ">
        {titlelistState && titlelistState.map((item) => {
            return (
                <div className=" my-2 md:mx-2">
        <Link  to={'/Works/' + (item.hashdate === 0 ? item.title : item.hashdate)} className='inline-block'>
        { item.hashdate === 0 ? <img
            loading='lazy'
            src={ `/images/Works/${item.title}/title.jpg`}
            alt={`Work Image ${item.title}`}
            className=" peer transition-all duration-500 hover:scale-105 object-cover md:w-[240px] md:h-[144px] w-[100px] h-[70px] "
        />
            : <img
            loading='lazy'
            src={ `/Posts/Works/${item.hashdate}/title.JPEG`}
            alt={`Work Image ${item.title}`}
            className=" peer transition-all duration-500 hover:scale-105 object-cover md:w-[240px] md:h-[144px] w-[100px] h-[70px] "
        />
    }
        <div className=" fixed peer-hover:fixed peer-hover:w-fit h-0 peer-hover:h-fit peer-hover:p-2 transition-all duration-500 opacity-0 peer-hover:opacity-100 ">
            <div>{item.title}</div>
        </div>
        <div className="peer-hover:mb-10"></div>
        </Link>
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
