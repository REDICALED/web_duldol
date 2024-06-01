import Slick from '@/components/Slick';
import '@/styles.scss'

  const ParseHtml = {
    replace: (node: any) => {
      if (node.type === 'text' && node.data.includes('[슬라이더입니다!]')) {
        let string = node.data;
        const imagesRegex = /images=<<<(.*?)>>>/;
        const imagesMatch = string.match(imagesRegex);
        const imagesStr = imagesMatch ? imagesMatch[1] : '';
        const imagesArray = imagesStr.split('%^&').map((url: string) => url.trim());


        // images_cap 추출
        const imagesCapRegex = /images_cap=<<<(.*?)>>>/;
        const imagesCapMatch = string.match(imagesCapRegex);
        const imagesCapStr = imagesCapMatch ? imagesCapMatch[1] : '';
        const imagesCapArray = imagesCapStr.split('%^&').map((cap: string) => cap.trim());
        

        return <Slick images={imagesArray} images_cap={imagesCapArray} />;
      }

      else if (node.type === 'text' && node.data.includes('[비디오입니다!]')) {
        let string = node.data;
        const videoRegex = /Videourl=<<<(.*?)>>>/;
        const videoMatch = string.match(videoRegex);
        const videoStr = videoMatch ? videoMatch[1] : '';

        return <iframe src={videoStr+"?autoplay=0"} className="w-full md:h-[550px]" ></iframe>;
      }

      else if (node.type === 'tag' && node.name === 'img') {
        const imgsrc = node.attribs.src
        return <img src={imgsrc} className="w-[100vw] object-cover " ></img>

      }
    }
  };


export default ParseHtml;
