import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const WorksPage = () => {

    const [titlelistState, settitlelistState] = useState<{title: string, year: string, hashdate: number, titleimg: string}[]>([]);
    useEffect(() => {
        GetImages();
    }
    ,[]);
    const GetImages = async () => {
        await fetch('/Posts.json')
        .then(response => response.json()) 
        .then(data => {
          // posts 배열 추출
          const posts = data.posts.sort((a: { year: string | number | Date; }, b: { year: string | number | Date; }) => {
            const dateA = new Date(a.year).getTime();
            const dateB = new Date(b.year).getTime();
            return dateB - dateA; // 최신순 정렬
          });;
          settitlelistState(posts);
        })
        .catch(error => console.error('Error fetching JSON:', error));
        
    }

    // 이미지 출력
    return (
        <>
            {/* 연도별 이미지 출력 */}
        <div className=" md:w-[680px] lg:grid lg:grid-cols-5 lg:gap-0 flex flex-wrap text-dul-gray leading-6 md:leading-6 pt-[10vh] md:pt-[15vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs ">
            {titlelistState.map((item) => (
                <div key={item.title} className=" md:m-2 m-1">
                    <div className="flex ">
                        { 
                            <Link key={item.title} to={'/Works/' + (item.hashdate === 0 ? item.title : item.hashdate)} className=''>
                            { item.hashdate === 0 ? <img
                                loading='lazy'
                                src={ `/images/Works/${item.title}/title.jpg`}
                                alt={`Work Image ${item.title}`}
                                className=" peer px-[0.1vw] transition-all duration-500 hover:scale-105 object-cover md:w-[120px] md:h-[72px] w-[70px] h-[42px] "
                            />
                                : <img
                                loading='lazy'
                                src={item.titleimg}
                                alt={`Work Image ${item.title}`}
                                className=" peer px-[0.1vw] transition-all duration-500 hover:scale-105 object-cover md:w-[120px] md:h-[72px] w-[70px] h-[42px] "
                            />
                            }
                            <div className=" fixed peer-hover:fixed peer-hover:w-fit h-0 peer-hover:h-fit peer-hover:p-2 transition-all duration-500 opacity-0 peer-hover:opacity-100 ">
                                <div>{item.title}</div>
                            </div>
                            <div className="peer-hover:mb-10"></div>
                            </Link>
                        }
                    </div>
                </div>
            ))}
        </div>
            
        </>
    );


    
    return (
        <>
            <div className="leading-6 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">

            </div>
        </>
    );
};


export default WorksPage;