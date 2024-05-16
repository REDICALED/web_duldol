import { useParams } from "react-router-dom";
import PostComponent1 from "@/components/initpages/PostComponent1";
import PostComponent2 from "@/components/initpages/PostComponent2";
import PostComponent3 from "@/components/initpages/PostComponent3";
import PostComponent4 from "@/components/initpages/PostComponent4";
import PostComponent5 from "@/components/initpages/PostComponent5";
import PostComponent6 from "@/components/initpages/PostComponent6";
import PostComponent7 from "@/components/initpages/PostComponent7";
import PostComponent8 from "@/components/initpages/PostComponent8";
import PostComponent9 from "@/components/initpages/PostComponent9";
import PostComponent10 from "@/components/initpages/PostComponent10";
import PostComponent11 from "@/components/initpages/PostComponent11";
import PostComponent12 from "@/components/initpages/PostComponent12";
import ErrPage from "@/pages/ErrPage";



const PostPage = () => {
    const tags = useParams();
    console.log(tags.id);
    if (tags.id === "감정의 정반합") 
        return <PostComponent1 />;
    else if (tags.id === "단단한 여자애의 소망") 
        return <PostComponent2 />;
    else if (tags.id === "돌계란(stonegg)") 
        return <PostComponent3 />;
    else if (tags.id === "모양들(shapes)") 
        return <PostComponent4 />;
    else if (tags.id === "미뢔(MIRWAE)") 
        return <PostComponent5 />;
    else if (tags.id === "신원계 新圓界 - 파고착조 破觚斲雕_") 
        return <PostComponent6 />;
    else if (tags.id === "여린 것들의 슬픔") 
        return <PostComponent7 />;
    else if (tags.id === "유하다") 
        return <PostComponent8 />;
    else if (tags.id === "중성인간(neutral person)") 
        return <PostComponent9 />;
    else if (tags.id === "thinking about pebble") 
        return <PostComponent10 />;
    else if (tags.id === "metamorphosis") 
        return <PostComponent11 />;
    else if (tags.id === "murmur-mural ensemble(웅얼웅얼-벽화 합창)") 
        return <PostComponent12 />;
    else
        return <ErrPage/>
};


export default PostPage;
