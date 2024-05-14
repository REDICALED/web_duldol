import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Dropdown = () => {
    const [currentPath, setCurrentPath] = useState(location.pathname);

    useEffect(() => {
        setCurrentPath(location.pathname);
    }, [location.pathname]);
    return (
        <div className=" font-medium mr-[3vw] text-right ">
            <div className=" text-right ">
                <Link to="/" className={ currentPath==="/" ? " text-gray-300  " : " text-gray-500" }>Home</Link>
            </div>

            <div className="mt-[1vh]">
                <Link to="/Works" className={ currentPath==="/Works" ? " text-gray-300 " : " text-gray-500" }>Works</Link>
            </div>

            <div className="mt-[1vh]">

                <Link to="/Note" className={ currentPath==="/Note" ? " text-gray-300 " : " text-gray-500" }>Note</Link>
            </div>

            <div className="mt-[1vh]">
                <Link to="/cv" className={ currentPath==="/cv" ? " text-gray-300 " : " text-gray-500" }>cv</Link>
            </div>

            <div className=" mt-[1vh]">

                <Link to="/Contact" className={ currentPath==="/Contact" ? " text-gray-300 " : " text-gray-500" }>Contact</Link>
            </div>
        </div>
    );
}

export default Dropdown;