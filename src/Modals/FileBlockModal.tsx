import { motion } from "framer-motion";
// import { GitFileBlock } from "../atoms/ModalAtom";
// import { useRecoilState } from "recoil";
import {ThreeDotsWave} from "@/components/ThreeDotsWave";

export const FileBlockModal = () => {

    // const [, setFileBlock] = useRecoilState(GitFileBlock);

  //   const closeModal = (event: any) => {
  //     setFileBlock(event.target.value);
  // };
  return (
    <div>
    <motion.div
    initial={{ opacity: 0, y: "-100%" }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.1 }}
    className="fixed top-0 left-0 w-full h-full bg-gray-700 bg-opacity-75 flex justify-center items-center z-50"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white p-4 w-full max-w-2xl rounded-lg shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-gray-300 pb-2">
        <h3 className="text-xl font-semibold text-gray-900">파일 선택</h3>
        <button
          type="button"
          className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8"
        >
          <span className="flex justify-center items-center w-full h-full">
            <svg
              className="w-3 h-3 mx-auto"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </span>
          <span className="sr-only">닫기</span>
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div className="text-base leading-relaxed text-gray-500">
          파일 업로드, 삭제 중입니다... 잠시만 기다려주세요..
        </div>
        <ThreeDotsWave/>
      </div>
    </motion.div>
  </motion.div>
  </div>
)
};