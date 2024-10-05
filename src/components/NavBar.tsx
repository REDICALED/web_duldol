import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { LoginValid } from "@/atoms/LoginValidAtom";
import { useRecoilState } from "recoil";





const NavBar = () => {
    const location = useLocation();

    const [currentPath, setCurrentPath] = useState(location.pathname);
    const [ loginvaild , ] = useRecoilState(LoginValid);

    useEffect(() => {
        setCurrentPath(location.pathname);
    }, [location.pathname]);
    return (
        <>
        
        <div className=" w-[100vw] ml-[3vw] fixed mt-[2vh] z-40 lg:flex font-dongle">
            <div className=" lg:text-5xl text-3xl m-2 ">
                DULDOL JUNG
            </div>
            <div className=" m-2 font-medium text-2xl lg:text-3xl lg:right-[10vw] lg:absolute lg:flex lg:space-x-10 max-w-full overflow-hidden">

                <div className=" hover:opacity-55 transition-opacity">
                <Link to="/Works" >
                    <div className={ currentPath.includes("Works") ? ` text-gray-400 ` : ` text-gray-900`}>works</div>
                </Link>
                </div>

                <div className=" hover:opacity-55 transition-opacity">
                <Link to="/Note" >
                    <div className={ currentPath.includes("Note") ? ` text-gray-400 ` : ` text-gray-900`}>note</div>
                </Link>                
                </div>

                <div className=" hover:opacity-55 transition-opacity">
                <Link to="/cv" >
                    <div className={ currentPath.includes("cv") ? ` text-gray-400 ` : ` text-gray-900`}>cv</div>
                </Link>                
                </div>

                <div className=" hover:opacity-55 transition-opacity">
                <Link to="/Contact" >
                    <div className={ currentPath.includes("Contact") ? ` text-gray-400 ` : ` text-gray-900`}>contact</div>
                </Link>                
                </div>

                { loginvaild === 1 && <div className=" hover:opacity-55 transition-opacity">
                <Link to="/memo" >
                    <div className={ currentPath.includes("memo") ? ` text-gray-400 ` : ` text-gray-900`}>memo</div>
                </Link>                
                </div>}

                { loginvaild === 1 && <div className=" hover:opacity-55 transition-opacity">
                <Link to="/editor" >
                    <div className={ currentPath.includes("editor") ? ` text-gray-400 ` : ` text-gray-900`}>editor</div>
                </Link>                
                </div>}
            </div>
        </div>
        </>
    );
}

export default NavBar;