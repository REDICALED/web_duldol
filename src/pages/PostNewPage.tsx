import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import parse from 'html-react-parser';
import { useSetRecoilState } from 'recoil';
import ParseHtml from '@/components/TipTap/ParseHtml';
import { ImageZoom } from '@/atoms/ModalAtom';
import { ContentApiError, ContentPost, getPost, postCover } from '@/lib/content-api';

const PostNewPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState<ContentPost | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const setImageZoom = useSetRecoilState(ImageZoom);

  useEffect(() => {
    let active = true;
    setPost(null);
    setError('');
    setLoading(true);
    getPost(id || '').then(item => {
      if (active) setPost(item);
    }).catch(reason => {
      if (active) setError(reason instanceof ContentApiError && reason.status === 404 ? '작품을 찾을 수 없습니다.' : '작품을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const cover = post ? postCover(post) : '';
  return (
    <div className="leading-6 md:leading-6 text-dul-gray pt-[5vh] ml-[35vw] mb-10 md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
      {loading && <p role="status">콘텐츠를 불러오는 중입니다.</p>}
      {error && <div role="alert"><p>{error}</p><Link to="/Works">작품 목록으로 돌아가기</Link></div>}
      {post && <>
        <div className="flex mb-[1vh] md:mb-[0.5vh]">
          {cover && <img onClick={() => setImageZoom(cover)} src={cover} alt={post.title} className="cursor-zoom-in md:w-[100px] w-[60px] h-[60px] md:h-[100px] shrink-0 object-cover" />}
          <span className="w-full text-xxs md:text-xs m-1">{post.title}</span>
        </div>
        {parse(post.content_html, { replace: node => ParseHtml.replace(node, setImageZoom) })}
      </>}
    </div>
  );
};

export default PostNewPage;
