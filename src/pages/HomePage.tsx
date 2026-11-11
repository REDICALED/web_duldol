import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ContentPost, getPosts, postCover, postPath } from '@/lib/content-api';

const HomePage = () => {
    const [titlelistState, settitlelistState] = useState<ContentPost[]>([]);
    const [error, setError] = useState('');
    const getmainlist =  async () => {
        try {
        const items = await getPosts();
        const tmparray = [...items].sort((a, b) => {
            const dateA = new Date(a.year).getTime();
            const dateB = new Date(b.year).getTime();
            return dateB - dateA; // 최신순 정렬
          });
        const latestThree = tmparray.slice(0, 3);
        settitlelistState(latestThree);
        } catch {
          setError('작품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
        }
    }
    useEffect(() => {
        getmainlist();
    },[]);
    return (
    <div className=" text-dul-gray ml-[25vw] pl-10 mx-[15vw] xl:ml-[20vw] md:ml-[30vw] pt-[10vh] text-xs md:text-base ">
        <div className=" ">
        {error && <p role="alert">{error}</p>}
        {titlelistState && titlelistState.map((item) => {
            return (
                <div key={item.id} className=" my-2 md:mx-2">
        <Link to={postPath(item)} className='inline-block'>
        { postCover(item) && <img
            loading='lazy'
            src={postCover(item)}
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
