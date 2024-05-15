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




// import Dropdown from "./Dropdown";

const NavBar = () => {
    const location = useLocation();
    // const [dropdownstate, ToggleDropdown] = useState(false);

    const [currentPath, setCurrentPath] = useState(location.pathname);

    useEffect(() => {
        setCurrentPath(location.pathname);
    }, [location.pathname]);
    return (
        <>
        
        <div className=" w-[80px] md:w-[130px] ml-[3vw] fixed mt-[2vh] text-xs md:text-xl z-50">
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
            </div>
        </div>

        {/* <div className=" md:hidden block fixed right-0 end z-50 ">
            <div className=" pt-[1vh] text-xs font-medium 2sm:flex 2sm:justify-end text-right w-full ">
                <div className=" mx-1">
                    DULDOL JUNG
                </div>
                <div className="">
                    <button className="mr-2 2sm:mt-1 mt-2 2sm:ml-10 2sm:justify-end" onClick={()=>{ToggleDropdown(!dropdownstate)}}>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
                        </svg>
                    </button>
                    <div className={ dropdownstate ? " duration-300 transition-opacity bg-dul-gray bg-opacity-10 opacity-100 " : " opacity-0 bg-opacity-0 duration-500 transition-opacity bg-dul-gray mr-10 "}>
                        {dropdownstate && <Dropdown/>}
                    </div>
                </div>
            </div>
            
        </div> */}
        </>
    );
}

export default NavBar;