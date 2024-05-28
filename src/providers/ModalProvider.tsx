import { PropsWithChildren } from 'react';
import {
    useRecoilValue,
} from 'recoil';
import { FileRequire, LoginRequire,TitleRequire, GitFileBlock, ImageZoom } from '../atoms/ModalAtom.tsx';
import { FileRequireModal } from '../Modals/FileRequireModal.tsx';
import { TitleRequireModal } from '../Modals/TitleRequireModal.tsx';
import { LoginRequireModal } from '../Modals/LoginRequireModal.tsx';
import { FileBlockModal } from '../Modals/FileBlockModal.tsx';
import { ImageZoomModal } from '../Modals/ImageZoomModal.tsx';


const ModalProvider = ({ children }: PropsWithChildren) => {
    const isFileRequireModalOpen = useRecoilValue(FileRequire);
    const isLoginRequireModalOpen = useRecoilValue(LoginRequire);
    const isTitleRequireModalOpen = useRecoilValue(TitleRequire);
    const isFileBlockModalOpen = useRecoilValue(GitFileBlock);
    const isImageZoomModalOpen = useRecoilValue(ImageZoom);
    
    return (
        <>
            {isFileRequireModalOpen && <FileRequireModal/>}
            {isLoginRequireModalOpen && <LoginRequireModal/>}
            {isTitleRequireModalOpen && <TitleRequireModal/>}
            {isFileBlockModalOpen && <FileBlockModal/>}
            {isImageZoomModalOpen !== '' && <ImageZoomModal/>}
            
            {children}
        </>
    )
}

export default ModalProvider;