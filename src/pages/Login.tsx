import { LoginValid } from "@/atoms/LoginValidAtom";
import { LoginRequire } from "@/atoms/ModalAtom";
import { Navigate } from "react-router-dom";
import { useRecoilState } from "recoil";

const LoginPage = () => {
    const [ loginvalid , ] = useRecoilState(LoginValid);
    const [  , setLoginRequire] = useRecoilState(LoginRequire);
    if (loginvalid === 0) {
        setLoginRequire(true);
          return (<Navigate to="/" />);
      }
    window.location.href = '/';
    return (
        <>
        </>
    );
}

export default LoginPage;