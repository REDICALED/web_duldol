import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CONTENT_API_ENABLED, ContentPost, getPosts, postCover, postPath } from '@/lib/content-api';

const WorksPage = () => {

    const [titlelistState, settitlelistState] = useState<ContentPost[]>([]);
    const [error, setError] = useState('');
    useEffect(() => {
        GetImages();
    }
    ,[]);
    const GetImages = async () => {
        try {
          const items = await getPosts();
          const posts = CONTENT_API_ENABLED ? items : [...items].sort((a, b) => {
            const dateA = new Date(a.year).getTime();
            const dateB = new Date(b.year).getTime();
            return dateB - dateA; // 최신순 정렬
          });;
          settitlelistState(posts);
        } catch {
          setError('작품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
        }
        
    }

    // 이미지 출력
    return (
        <>
            {/* 연도별 이미지 출력 */}
        <div className=" md:w-[680px] lg:grid lg:grid-cols-5 lg:gap-0 flex flex-wrap text-dul-gray leading-6 md:leading-6 pt-[10vh] md:pt-[15vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs ">
            {error && <p role="alert">{error}</p>}
            {titlelistState.map((item) => (
                <div key={item.id} className=" md:m-2 m-1">
                    <div className="flex ">
                        { 
                            <Link to={postPath(item)} className=''>
                            { postCover(item) && <img
                                loading='lazy'
                                src={postCover(item)}
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
