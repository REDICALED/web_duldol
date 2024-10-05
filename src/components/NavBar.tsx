import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import name from "@/assets/name.png";
import menu1contact from "@/assets/menu1-contact.png";
import menu1cv from "@/assets/menu1-cv.png";
import menu1home from "@/assets/menu1-home.png";
import menu1note from "@/assets/menu1-note.png";
import menu1works from "@/assets/menu1-works.png";
import menu2cv from "@/assets/menu2-cv.png";
import menu2home from "@/assets/menu2-home.png";
import menu2note from "@/assets/menu2-note.png";
import menu2works from "@/assets/menu2-works.png";
import menu2contact from "@/assets/menu2-contact.png";
import menu1memo from "@/assets/menu1-memo.png";
import menu2memo from "@/assets/menu2-memo.png";
import menu1editor from "@/assets/menu1-editor.png";
import menu2editor from "@/assets/menu2-editor.png";


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
            <div className=" lg:text-5xl text-3xl ">
                DULDOL JUNG
            </div>
            <div className=" font-medium text-2xl lg:text-3xl lg:right-[10vw] lg:absolute lg:flex space-x-10 max-w-full overflow-hidden">

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