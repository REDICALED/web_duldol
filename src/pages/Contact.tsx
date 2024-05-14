
const ContactPage = () => {
    return (
        <div >
        

        <div className=" leading-6 md:leading-6 text-dul-gray pt-[15vh] ml-[35vw] md:mx-[30vw] mr-[5vw] text-xxs md:text-xs">
            
            <a target="_blank" className="w-fit text-xs md:text-sm group relative overflow-hidden" href="mailto:steasolduldo@gmail.com">
                steasolduldo@gmail.com
            <div className="bg-black h-[1px] absolute bottom-0 left-0 w-0 group-hover:w-full transition-all duration-500"></div>
            </a>
            <br />
            <br />
            <span  className=" text-sm">ig:</span>
            <a target="_blank" className=" ml-[0.5vw] w-fit text-xs md:text-sm group relative overflow-hidden" href='https://www.instagram.com/steasolduldo'>
                @steasolduldo
                <div className="bg-black h-[1px] absolute bottom-0 left-0 w-0 group-hover:w-full transition-all duration-500"></div>
            </a>

            
        </div>
        
        </div>
    );
}

export default ContactPage;