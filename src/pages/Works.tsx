import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const WorksPage = () => {

    const [realarray, setRealArray] = useState<{ [year: number]: { title: string, year: number, hashdate: number }[] }>({});
    
    const GetImages = async () => {
        await fetch('/Posts.json')
        .then(response => response.json()) 
        .then(data => {
          // posts 배열 추출
          const posts = data.posts;
            console.log(posts);
          // 년도별로 그룹화하는 객체 생성
          const postsByYear = posts.reduce((acc: { [x: number]: any[]; }, post: { year: number; }) => {
            if (!acc[post.year]) {
              acc[post.year] = [];
            }
            acc[post.year].push(post);
            return acc; 
          }, {});
      
          // 그룹화된 데이터 확인
          console.log(postsByYear);
          setRealArray(postsByYear);
        })
        .catch(error => console.error('Error fetching JSON:', error));
        
    }


    // renderImages 함수 수정
const renderImages = () => {
    // 연도별로 이미지 그룹화
    const groupedByYear: { [year: number]: { title: string, year: number, hashdate: number }[] } = {};
    Object.values(realarray).forEach((yearArray) => {
        yearArray.forEach((item) => {
            if (!groupedByYear[item.year]) {
                groupedByYear[item.year] = [];
            }
            groupedByYear[item.year].push(item);
        });
    });

    // 이미지 출력
    return (
        <>
            {/* 연도별 이미지 출력 */}
        <div className=" text-dul-gray md:text-sm">
            {Object.keys(groupedByYear).reverse().map((year) => (
                <div key={year} className="">
                    <div className="mt-[0.5vh]">{year}</div>
                    <div className="flex ">
                        { groupedByYear[parseInt(year)].map((item: { title: string, year: number, hashdate: number }, index: number) => (
                            <div key={`${year}-${index}`} className="">
                            <Link key={index} to={'/Works/' + (item.hashdate === 0 ? item.title : item.hashdate)} className=''>
                            { item.hashdate === 0 ? <img
                                loading='lazy'
                                src={ `/images/Works/${item.title}/title.jpg`}
                                alt={`Work Image ${item.title}`}
                                className=" peer px-[0.1vw] transition-all duration-500 hover:scale-105 object-cover md:w-[120px] md:h-[72px] w-[70px] h-[42px] "
                            />
                                : <img
                                loading='lazy'
                                src={ `/Posts/Works/${item.hashdate}/title.JPEG`}
                                alt={`Work Image ${item.title}`}
                                className=" peer px-[0.1vw] transition-all duration-500 hover:scale-105 object-cover md:w-[120px] md:h-[72px] w-[70px] h-[42px] "
                            />
                        }
                            <div className=" fixed peer-hover:fixed peer-hover:w-fit h-0 peer-hover:h-fit peer-hover:p-2 transition-all duration-500 opacity-0 peer-hover:opacity-100 ">
                                <div>{item.title}</div>
                            </div>
                            <div className="peer-hover:mb-10"></div>
                            </Link>
                        </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
            
        </>
    );
};


    useEffect(() => {
        GetImages();
        if (realarray[2024] && realarray[2024][0]) {
            console.log(realarray[2024][0].title); 
        }
    }
    ,[]);
    return (
        <>
            <div className="leading-6 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
            {renderImages()}

            </div>
        </>
    );
}

export default WorksPage;