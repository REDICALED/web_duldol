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
        
        <div className=" w-[80px] md:w-[130px] ml-[3vw] fixed mt-[2vh] text-xs md:text-xl z-40">
            <img src={name} className="my-10 "/>
            <div className=" font-medium text-xxs md:text-base">
                <div className="mt-[2vh] w-[40px] md:w-[50px]">
                    <Link to="/" >
                    {
                        currentPath==="/" ? <img src={menu1home}/> : <img src={menu2home}/>
                    }
                    </Link>
                </div>

                <div className="mt-[2vh] w-[40px] md:w-[50px]">
                <Link to="/Works" >
                    {
                        currentPath.includes("Works") ? <img src={menu1works}/> : <img src={menu2works}/>
                    }
                </Link>
                </div>

                <div className="mt-[2vh] w-[30px] md:w-[40px]">
                <Link to="/Note" >
                    {
                        currentPath==="/Note" ? <img src={menu1note}/> : <img src={menu2note}/>
                    }
                </Link>                
                </div>

                <div className="mt-[2vh] w-[15px] md:w-[20px]">
                <Link to="/cv" >
                    {
                        currentPath==="/cv" ? <img src={menu1cv}/> : <img src={menu2cv}/>
                    }
                </Link>                
                </div>

                <div className="mt-[2vh] w-[55px] md:w-[75px]">
                <Link to="/Contact" >
                    {
                        currentPath==="/Contact" ? <img src={menu1contact}/> : <img src={menu2contact}/>
                    }
                </Link>                
                </div>

                { loginvaild === 1 && <div className="mt-[2vh] w-[45px] md:w-[55px]">
                <Link to="/memo" >
                    {
                        currentPath==="/memo" ? <img src={menu1memo}/> : <img src={menu2memo}/>
                    }
                </Link>                
                </div>}

                { loginvaild === 1 && <div className="mt-[1.7vh] w-[45px] md:w-[57px]">
                <Link to="/editor" >
                    {
                        currentPath==="/editor" ? <img src={menu1editor}/> : <img src={menu2editor}/>
                    }
                </Link>                
                </div>}
            </div>
        </div>
        </>
    );
}

export default NavBar;