import { motion,useAnimation } from "framer-motion";
import { LoginRequire } from "../atoms/ModalAtom";
import { useRecoilState } from "recoil";
import { useState } from "react";
import { LoginValid } from "@/atoms/LoginValidAtom";

export const LoginRequireModal = () => {
    const [, setLoginRequire] = useRecoilState(LoginRequire);
    const [ loginvaild , setLoginValid] = useRecoilState(LoginValid);

    const [inputpassword, setInputPassword] = useState("");
    const [wrongpassword, IsWrongPassword] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [graymodal, setGrayModal] = useState(false);

    const controls = useAnimation();

    const closeModal = (event: any) => {
        setGrayModal(true);
        setTimeout(() => setLoginRequire(event.target.value), 200);
    };

    const passwordcheck = async (event: any) => {
        event.preventDefault(); 
        if(inputpassword === import.meta.env.VITE_APP_PASSWORD){
            closeModal(false);
            setLoginValid(loginvaild + 1)
            //console.log("00.")
        }else{
            IsWrongPassword(true);
            //console.log("nono")
            await setIsShaking(true); // 흔들리는 애니메이션 시작
            controls.start({ x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } }); // 흔들리는 애니메이션 제어
            setTimeout(() => setIsShaking(false), 500);
        }
    }

    return (
        <motion.div
            initial={graymodal ? { opacity: 1, y: "0%" } : { opacity: 0, y: "-100%" }}
            animate={graymodal ? { opacity: 0, y: "-100%" } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 w-full h-full bg-gray-700 bg-opacity-75 flex justify-center items-center z-50"
        >
            <motion.div
                initial={{ scale: 0 }}
                transition={{ delay: 0.2 }}
                className="fixed bg-white p-4 w-full max-w-2xl rounded-lg shadow-lg overflow-hidden"
                animate={isShaking ? controls : {scale: 1}}
            >
                <div className="flex items-center justify-between border-b border-gray-300 pb-2">
                    <h3 className=" text-2xl font-semibold text-gray-900">로그인</h3>
                    <button
                        type="button"
                        className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-12 h-12"
                        onClick={closeModal}
                    >
                        <span className="flex justify-center items-center w-full h-full">
                            <svg
                                className="w-4 h-4 mx-auto"
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
                <form onSubmit={passwordcheck}>
                <div className="p-4 space-y-4">
                    <p className="text-base leading-relaxed text-gray-500">
                        Hi Deuldol
                    </p>
                    <input
                    name="main_content" placeholder="Password" 
                    className=" mt-10 w-full h-1/2 border-2 border-gray-300 rounded-lg p-2.5 "
                    onChange={(e:any) => setInputPassword(e.target.value)}
                    />
                    <button onClick={passwordcheck} type="button" className="mt-10 font-medium rounded-lg w-full h-10 text-sm px-5 py-2.5 me-2 mb-2 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300">로그인</button>
                </div>
                {wrongpassword && <p className="text-red-600"> Password incorrect </p>
                }
                </form>
            </motion.div>
        </motion.div>
    );
};
