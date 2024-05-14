import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Dropdown from "./Dropdown";

const NavBar = () => {
    const location = useLocation();
    const [dropdownstate, ToggleDropdown] = useState(false);

    const [currentPath, setCurrentPath] = useState(location.pathname);

    useEffect(() => {
        setCurrentPath(location.pathname);
    }, [location.pathname]);
    return (
        <>
        
        <div className=" hidden md:block font-semibold ml-[2vw] fixed mt-[10vh]  md:text-xl">
            DULDOL JUNG
            <div className=" font-medium text-base ">
                <div className="mt-[3vh] ">
                    <Link to="/" className={ currentPath==="/" ? " text-dul-white " : " text-dul-gray" }>Home</Link>
                </div>

                <div className="mt-[1vh]">
                    <Link to="/Works" className={ currentPath.includes("Works") ? " text-dul-white " : " text-dul-gray" }>Works</Link>
                </div>

                <div className="mt-[1vh]">

                    <Link to="/Note" className={ currentPath==="/Note" ? " text-dul-white " : " text-dul-gray" }>Note</Link>
                </div>

                <div className="mt-[1vh]">
                    <Link to="/cv" className={ currentPath==="/cv" ? " text-dul-white " : " text-dul-gray" }>cv</Link>
                </div>

                <div className=" mt-[1vh]">

                    <Link to="/Contact" className={ currentPath==="/Contact" ? " text-dul-white " : " text-dul-gray" }>Contact</Link>
                </div>
            </div>
        </div>

        <div className=" md:hidden block fixed right-0 end z-50 ">
            <div className=" pt-[1vh] text-base font-medium 2sm:flex 2sm:justify-end text-right w-full ">
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
            
        </div>
        </>
    );
}

export default NavBar;