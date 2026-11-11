import Slick from '@/components/Slick';
import '@/styles.scss'

  const ParseHtml = {
    replace: (node:any, setImageZoom:any) => {

      if (node.type === 'text' && node.data.includes('[슬라이더입니다!]')) {
        let string = node.data;
        // images_cap 추출
        const imagesCapRegex = /images_cap=<<<(.*?)>>>/;
        const imagesCapMatch = string.match(imagesCapRegex);
        const imagesCapStr = imagesCapMatch ? imagesCapMatch[1] : '';
        const imagesCapArray = imagesCapStr.split('#$%^').map((cap: string) => cap.trim());
        
        const imagesUrlRegex = /images=<<<(.*?)>>>/;
        const imagesUrlMatch = string.match(imagesUrlRegex);
        const imagesUrlStr = imagesUrlMatch ? imagesUrlMatch[1] : '';
        const imagesUrlArray = imagesUrlStr.split('#$%^').map((cap: string) => cap.trim());
        // console.log(imagesCapArray);
        // const realimagesArray = imagesCapArray.map((url: string) => {
        //   return `/Posts/Works/${tags.id}/${url}`;
        // });
        return <Slick images={imagesUrlArray} images_cap={imagesCapArray} />;
      }

      else if (node.type === 'text' && node.data.includes('[비디오입니다!]')) {
        let string = node.data;
        const videoRegex = /Videourl=<<<(.*?)>>>/;
        const videoMatch = string.match(videoRegex);
        const videoStr = videoMatch ? videoMatch[1] : '';

        try {
          const video = new URL(videoStr);
          video.searchParams.set('autoplay', '0');
          return <iframe src={video.href} title="동영상" loading="lazy" allowFullScreen className="w-full md:h-[550px]" />;
        } catch { return <></>; }
      }

      else if (node.type === 'tag' && node.name === 'img') {
        const imgsrc = node.attribs.src
        return <img loading="lazy" onClick={()=>{setImageZoom(imgsrc)}} src={imgsrc} referrerPolicy="no-referrer" className="w-[100vw] object-cover cursor-zoom-in" ></img>

      }
    }
  };


export default ParseHtml;
