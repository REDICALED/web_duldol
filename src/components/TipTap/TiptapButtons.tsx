
import { PostGenreType } from '@/atoms/PostingAtom';
import '@/styles.scss'
import { useRecoilState } from 'recoil';
import SetContents from '@/components/TipTap/SetContents';
import { Octokit } from 'octokit';
import { tiptapMainText } from '@/atoms/TiptapAtom';
import { createFunc, getFunc, updateFunc } from '@/components/Git/GitFunc';
import { FileRequire, GitFileBlock } from '@/atoms/ModalAtom';
import SetTitleImage from '@/components/TipTap/SetTitleImage';
import axios from 'axios';

export const UploadButton = (props:any) => {
  const [ MainText ] = useRecoilState(tiptapMainText);
  const [ GenreType , ] = useRecoilState(PostGenreType);
    const [ ,SetGitFileBlock ] = useRecoilState(GitFileBlock);
    const [ , setFileRequire] = useRecoilState(FileRequire);

    const getBlob = async () => {
      const octokit = new Octokit({
        auth: import.meta.env.VITE_APP_TOKEN,
      });
      const hashdate = Date.now();
      //main.html 업로드
      const result = await createFunc(octokit, `Posts/Works/${hashdate}/main.html`, props.tiptapeditor.getHTML(), "main html generated");
      console.log("create main.html put request:" + result.status);
      const titlename = await createFunc(octokit, `Posts/Works/${hashdate}/titlename.txt`, `${props.tiptapPostTitle}\n${props.tiptapPostDate}`, "titlename.txt generated");
      console.log("create title.txt put request:" + titlename.status);

      //title 이미지 업로드
      if (props.tiptapPostTitleImage) {
        let base64encoded = props.tiptapPostTitleImage.base64;
        const apiURL = `https://api.github.com/repos/${import.meta.env.VITE_APP_OWNER}/${import.meta.env.VITE_APP_REPO}/contents/public/Posts/Works/${hashdate}/title.JPEG`;
        console.log('%c ', `font-size:1px; padding:100px; background:url(${base64encoded}) no-repeat; background-size:contain;`);
        console.log('Uploading image:', 'title.jpg');
        if (base64encoded.startsWith('data:image/jpeg;base64,')) {
          base64encoded = base64encoded.replace('data:image/jpeg;base64,', '');
        }
        try {
          const response = await axios.put(
            apiURL,
            {
              message: "Add image",
              content: base64encoded,
              branch: "main",
            },
            {
              headers: {
                Authorization: `token ${import.meta.env.VITE_APP_TOKEN}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("Image uploaded successfully:", response.data.content.name);
        } catch (e) {
          console.error("Error uploading image:", e);
        }
        // 각 업로드 요청 사이에 5초 지연
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      //이미지 업로드
      if (props.tiptapPostSliderStack) {
        for (let i = 0; i < props.tiptapPostSliderStack.length; i++) {
          for (let j = 0; j < props.tiptapPostSliderStack[i].blobUrl.length; j++) {
            let base64encoded = props.tiptapPostSliderStack[i].base64[j];
            const apiURL = `https://api.github.com/repos/${import.meta.env.VITE_APP_OWNER}/${import.meta.env.VITE_APP_REPO}/contents/public/Posts/Works/${hashdate}/${props.tiptapPostSliderStack[i].ImageName[j]}`;
            console.log('%c ', `font-size:1px; padding:100px; background:url(${base64encoded}) no-repeat; background-size:contain;`);
            console.log('Uploading image:', props.tiptapPostSliderStack[i].ImageName[j]);
            console.log(props.tiptapPostSliderStack);
            if (base64encoded.startsWith('data:image/jpeg;base64,')) {
              base64encoded = base64encoded.replace('data:image/jpeg;base64,', '');
            }
            try {
              const response = await axios.put(
                apiURL,
                {
                  message: "Add image",
                  content: base64encoded,
                  branch: "main",
                },
                {
                  headers: {
                    Authorization: `token ${import.meta.env.VITE_APP_TOKEN}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              console.log("Image uploaded successfully:", response.data.content.name);
            } catch (e) {
              console.error("Error uploading image:", e);
            }
            // 각 업로드 요청 사이에 5초 지연
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }
      //state에서 base64 이미지들 전부 업로드 
      


     
        const tmpPosts = await fetch('/Posts.json')
        .then(response => response.json()) 
        .then(data => {
          // posts 배열 추출
          const posts: { title: string, year: number, hashdate: number }[] = data.posts;
            console.log(posts);
            posts.push({title: props.tiptapPostTitle, year: parseInt(props.tiptapPostDate.split('-')[0]), hashdate: hashdate});
            console.log(JSON.stringify(posts));
            const tmpPosts = `{ "posts": ` + JSON.stringify(posts) + ` }`;
            
            return tmpPosts;
          })
        .catch(error => console.error('Error fetching JSON:', error));
        
        const postresult = await updateFunc(octokit, `Posts.json`, tmpPosts, `post.json updated`);
        console.log("fix Posts.json put request:" + postresult .status);
        //posts.json 업데이트

    }

    const uploadContents = async () => {
      const octokit = new Octokit({
        auth: import.meta.env.VITE_APP_TOKEN,
      });
      if ( GenreType === "post" )
      {
        console.log(props.tiptapPostTitleImage)
        if ( props.tiptapPostTitle === '' || props.tiptapPostDate === '' || (props.tiptapPostTitleImage.base64 === '' && props.tiptapPostTitleImage.blobUrl === ''))
        {
          setFileRequire(true);
          return;
        }
        else
        {
          SetGitFileBlock(true);
          // const puttitle = await createFunc(octokit, `Posts/Works/${props.tiptapPostTitle}/main.html`, MainText, `${props.tiptapPostTitle} main.html uploaded`);
          await getBlob();
          console.log(props.tiptapeditor.getHTML());
          //Main Text의 슬라이더들의 이미지 파싱, 후처리 (paesehtml 수정?) 나중에 확인
          //Main Text 상단에, 제목/제목이미지 삽입 이것도 나중에 확인
          //createFunc로 MainText html, title 이미지 업로드 
          //createFunc로 슬라이더에 쓰인 이미지들 업로드 (하려면 파싱해야되나? -> ㄴㄴ 그냥 url 형태로 건네버려서 git에 업로드 하면 될듯?)
          SetGitFileBlock(false);
          // console.log(puttitle.status);
        }
      }
      else
      {
        SetGitFileBlock(true);
        const puttitle = await updateFunc(octokit, `Posts/${GenreType}.html`, MainText, `${GenreType} updated`);
        SetGitFileBlock(false);
        console.log(puttitle.status);
      }
    }
    return (
      <div className=" pb-[2vh] ">
        <button onClick={()=>{
        uploadContents();
        }} type="button" className=" transition-all duration-300 mt-[1vh] mr-[1vw] min-w-[19vw] max-w-[20vw] min-h-[10vh] max-h-[10vh] text-gray-900 bg-white hover:bg-gray-200 border-2 border-dul-gray focus:ring-4 focus:outline-none focus:ring-gray-100 rounded-lg text-center inline-flex items-center">
          <p className=" justify-center min-w-[15vw] max-w-[15vw] xs:min-w-[20vw] sm:min-w-[20vw] sm:text-l md:min-w-[20vw] md:text-xl lg:text-xl xl:text-3xl pr-[1vw]">업로드</p> 
        </button>        
        
        </div>
    );
  };

  //미리보기 버튼
  export const UploadPreviewButton = (props:any) => {
    const resetSliderStack = async () => {
    console.log(props.tiptapPostSliderStack);
    for (let i = 0; i < props.tiptapPostSliderStack.length; i++)
      {
        if (!props.tiptapeditor.getHTML().includes(props.tiptapPostSliderStack[i].blobUrl[0]))
          {
            console.log("aa");
            const temp = props.tiptapPostSliderStack[i];
            console.log(temp);
            const updatedStack = props.tiptapPostSliderStack.filter((item: any) => item !== temp);
            console.log(updatedStack);

            await props.settiptapPostSliderStack(updatedStack);
          }
      }
      console.log(props.tiptapPostSliderStack);
    }
      return (
        <div className=" pb-[2vh] ">
          <button onClick={async ()=>{
            props.setPreviewSwitch(!props.PreviewSwitch);
            await resetSliderStack();
            console.log(props.tiptapPostTitleImage)
          }} type="button" className=" transition-all duration-300 mt-[1vh] mr-[1vw] min-w-[19vw] max-w-[20vw] min-h-[10vh] max-h-[10vh] text-gray-900 bg-white hover:bg-gray-200 border-2 border-dul-gray focus:ring-4 focus:outline-none focus:ring-gray-100 rounded-lg text-center inline-flex items-center">
            <p className=" justify-center min-w-[15vw] max-w-[15vw] xs:min-w-[20vw] sm:min-w-[20vw] sm:text-l md:min-w-[20vw] md:text-xl lg:text-xl xl:text-3xl pr-[1vw]">미리보기</p> 
          </button>
          </div>
      );
    };

  export const SetGenreButton = (props:any) => {
    const [ GenreType , setGenreType] = useRecoilState(PostGenreType);
    return (
      <div className=" ">
        <label htmlFor="genre" className=" block text-l font-medium text-black">Uploading Type</label>
        <div className=" min-h-[8vh] max-h-[8vh] flex ">
          <select id="genre" 
          onChange={
            (e:any) => {
                setGenreType(e.target.value);
                if ( GenreType !== "post" )
                {
                  props.settiptapPostDate('');
                  props.settiptapPostTitleImage({ blobUrl: '', base64: '' });
                  props.settiptapPostTitle('');
                }
              }
          } 
          className=" min-h-[5vh] max-h-[5vh] bg-gray-50 border border-gray-300 text-gray-900 text-l rounded-lg focus:ring-blue-500 focus:border-blue-500 block  w-[30vw] ">
            <option value="memo">memo</option>
            <option value="cv">cv</option>
            <option value="contact">contact</option>
            <option value="note">note</option>
            <option value="post">post</option>
          </select>
          { GenreType !== "post" && <SetContents {... props}/>}
        </div>
        { GenreType === "post" && <SetTitleImage {... props}/>}

        </div>
    );
  };
  export const RemoveButton = () => {

    return (
      <div className=" ">
        <button> 글삭제 </button>
  
      </div>
    );
  };
  export const PostList = () => {

    return (
      <div className=" ">
        <button> 메인지정 </button>
  
      </div>
    );
  };
        