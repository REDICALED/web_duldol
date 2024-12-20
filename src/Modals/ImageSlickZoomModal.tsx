import { ImageSlickZoom } from '@/atoms/ModalAtom';
import { useEffect } from 'react';
import { useRecoilState } from "recoil";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import ZoomSlick from '@/components/ZoomSlick';

export const ImageSlickZoomModal = () => {
  const [imageslickzoom, setImageSlickZoom] = useRecoilState(ImageSlickZoom);

  const closeModal = () => {
    setImageSlickZoom({SlickImages: [], index: 0});
  }

  useEffect(() => {
    const handlePopstate = () => {
      closeModal();
    };

    // popstate 이벤트 리스너 등록
    window.addEventListener('popstate', handlePopstate);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);

  return (
    <div className=' transition-all duration-500 ease-in-out'>
      <div
        className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-75 flex justify-center items-center z-50"
      >
        <ZoomSlick images={imageslickzoom.SlickImages} images_cap={ imageslickzoom.SlickImages} ></ZoomSlick>
      </div>
    </div>
  );
};
