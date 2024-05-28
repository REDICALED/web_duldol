import { ImageZoom } from '@/atoms/ModalAtom';
import { useEffect } from 'react';
import { useRecoilState } from "recoil";

export const ImageZoomModal = () => {
  const [imagezoom, setImageZoom] = useRecoilState(ImageZoom);

  const closeModal = () => {
    setImageZoom('');
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
        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center z-50"
        onClick={closeModal}
      >
          <img src={imagezoom} className=' max-h-[100vh]' />
      </div>
    </div>
  );
};
