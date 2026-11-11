import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import { useSetRecoilState } from 'recoil';
import ParseHtml from '@/components/TipTap/ParseHtml';
import { ImageZoom } from '@/atoms/ModalAtom';
import { CONTENT_API_ENABLED, getPage } from '@/lib/content-api';

const ContactPage = () => {
    const [html, setHtml] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(CONTENT_API_ENABLED);
    const setImageZoom = useSetRecoilState(ImageZoom);
    useEffect(() => {
      if (!CONTENT_API_ENABLED) return;
      let active = true;
      getPage('contact').then(page => { if (active) setHtml(page.content_html); })
        .catch(() => { if (active) setError('연락처를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'); })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, []);

    if (CONTENT_API_ENABLED) return (
      <div className="leading-6 md:leading-6 text-dul-gray pt-[15vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
        {loading && <p role="status">콘텐츠를 불러오는 중입니다.</p>}
        {error && <p role="alert">{error}</p>}
        {parse(html, { replace: node => ParseHtml.replace(node, setImageZoom) })}
      </div>
    );

    return (
        <div >
        

        <div className=" leading-6 md:leading-6 text-dul-gray pt-[15vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
            
            <a target="_blank" className="w-fit text-xs md:text-sm group relative overflow-hidden" href="mailto:steasolduldo@gmail.com">
                steasolduldo@gmail.com
            <div className="bg-black h-[1px] absolute bottom-0 left-0 w-0 group-hover:w-full transition-all duration-500"></div>
            </a>
            <br />
            <br />
            <span  className=" text-sm">ig:</span>
            <a target="_blank" className=" ml-[0.5vw] w-fit text-xs md:text-sm group relative overflow-hidden" href='https://www.instagram.com/steasolduldo'>
                @steasolduldo
                <div className="bg-black h-[1px] absolute bottom-0 left-0 w-0 group-hover:w-full transition-all duration-500"></div>
            </a>

            
        </div>
        
        </div>
    );
}

export default ContactPage;
