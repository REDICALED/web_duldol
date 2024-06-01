import { PropsWithChildren } from 'react';
import {
    useRecoilValue,
} from 'recoil';
import { FileRequire, LoginRequire,TitleRequire, GitFileBlock, ImageZoom, ImageSlickZoom } from '../atoms/ModalAtom.tsx';
import { FileRequireModal } from '../Modals/FileRequireModal.tsx';
import { TitleRequireModal } from '../Modals/TitleRequireModal.tsx';
import { LoginRequireModal } from '../Modals/LoginRequireModal.tsx';
import { FileBlockModal } from '../Modals/FileBlockModal.tsx';
import { ImageZoomModal } from '../Modals/ImageZoomModal.tsx';
import { ImageSlickZoomModal } from '../Modals/ImageSlickZoomModal.tsx';


const ModalProvider = ({ children }: PropsWithChildren) => {
    const isFileRequireModalOpen = useRecoilValue(FileRequire);
    const isLoginRequireModalOpen = useRecoilValue(LoginRequire);
    const isTitleRequireModalOpen = useRecoilValue(TitleRequire);
    const isFileBlockModalOpen = useRecoilValue(GitFileBlock);
    const isImageZoomModalOpen = useRecoilValue(ImageZoom);
    const isImageSlickZoomModalOpen = useRecoilValue(ImageSlickZoom);

    
    return (
        <>
            {isFileRequireModalOpen && <FileRequireModal/>}
            {isLoginRequireModalOpen && <LoginRequireModal/>}
            {isTitleRequireModalOpen && <TitleRequireModal/>}
            {isFileBlockModalOpen && <FileBlockModal/>}
            {isImageZoomModalOpen !== '' && <ImageZoomModal/>}
            {isImageSlickZoomModalOpen.SlickImages.length > 0 && <ImageSlickZoomModal/>}
            {children}
        </>
    )
}

export default ModalProvider;