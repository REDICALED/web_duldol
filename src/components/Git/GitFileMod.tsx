import { getFunc, updateFunc, createFunc, createImage, getJsonFunc } from "@/components/Git/GitFunc";
import { Octokit } from "octokit";
import Resizer from "react-image-file-resizer";

export const resizeFile = (file: File): Promise<File>  =>
    new Promise((res) => {
      Resizer.imageFileResizer(
        file, // target file
        1500, // maxWidth
        1500, // maxHeight
        "JPEG", // compressFormat : Can be either JPEG, PNG or WEBP.
        100, // quality : 0 and 100. Used for the JPEG compression
        0, // rotation
        (uri) => res(uri as File), // responseUriFunc
        "file" // outputType : Can be either base64, blob or file.(Default type is base64)	
      );
    // console.log("resizeFile");
    }
  );

  export const resizeTitleFile = (file: File): Promise<File>  =>
    new Promise((res) => {
      Resizer.imageFileResizer(
        file, // target file
        1500, // maxWidth
        1500, // maxHeight
        "JPEG", // compressFormat : Can be either JPEG, PNG or WEBP.
        60, // quality : 0 and 100. Used for the JPEG compression
        0, // rotation
        (uri) => res(uri as File), // responseUriFunc
        "file" // outputType : Can be either base64, blob or file.(Default type is base64)	
      );
    // console.log("resizetitleFile");
    }
  );

  //getdiff /path
  export const getDiff = async (path:any) => {
    const octokit = new Octokit({
      auth: import.meta.env.VITE_APP_TOKEN,
    }); 
    await updateFunc(octokit, "diff/diff.txt", Date.now() ,path);
  };
  
  //파일 생성 repo, path, contents, imageuploaded, titleimageuploaded, untitled, setFileRequire, setTitleRequire
  export const fileCreate = async (repo:any, path:any, contents:any, tags:string, imageuploaded:any , titleimageuploaded:any, untitled:any, setFileRequire:any, setTitleRequire:any, setFileBlock:any ) => {
    
    const octokit = new Octokit({
      auth: import.meta.env.VITE_APP_TOKEN,
    });

    const fileList: FileList | null = (document.getElementById('dropzone-file') as HTMLInputElement).files;
    const titlefile: FileList | null = (document.getElementById('title-file') as HTMLInputElement).files;

    if (!imageuploaded || !titleimageuploaded) {
      // 파일 리스트가 비어 있으면 모달을 표시
      setFileRequire(true);
      return;
    }
    if (path === "" && untitled === false) {
      // path가 비어 있으면 모달을 표시
      setTitleRequire(true);
      return;
    }
  
    setFileBlock(true);
    //sub.txt add
    const tmpPath = untitled ? "untitled" : `${path}`;
    const pathkey = Date.now();
    await createFunc(octokit, `${repo}/${pathkey}-${tags}-${tmpPath}/sub.txt`, `${fileList?.length}\n${contents}`, path);
    
    let finished = false;
    const uploadImageWithDelay = async () => {
      if (titlefile && titlefile !== null) {
        const resizedFile = await resizeTitleFile(titlefile[0]);
        await createImage(resizedFile,`${repo}/${pathkey}-${tags}-${tmpPath}`, 'title');
      }
      if (fileList) {
        for (let i = 0; i < fileList.length; i++) {
        const resizedFile = await resizeFile(fileList[i]);
          await new Promise<void>((resolve) => {
            setTimeout(async () => {
              await createImage(resizedFile, `${repo}/${pathkey}-${tags}-${tmpPath}`, i + 'image');
              await resolve();
            }, 5000); // 5초 delay
          });
        }
      }
      return true;
    };
  
    //파일 업로드
    if (fileList && titlefile) {
      finished = await uploadImageWithDelay();
  }
  if (finished)
    setFileBlock(false);
  };

  //파일 sub 내용 읽기
  export const fileMainImageSet = async (repo:any, mainimages:any, setFileBlock:any) => {
    setFileBlock(true);
    const octokit = new Octokit({
      auth: import.meta.env.VITE_APP_TOKEN,
    });
  
    const mainlist = mainimages.join(',');
    await updateFunc(octokit, `${repo}/mainlist.txt`, mainlist, 'mainlist updated');
    setFileBlock(false);
  };

  //파일 지우기
  export const fileDelete = async (repo:any, modtitle:any, setFileBlock:any) => {
    setFileBlock(true);
    const octokit = new Octokit({
      auth: import.meta.env.VITE_APP_TOKEN,
    });
    for (let i = 0; i < modtitle.length; i++) {
      if (modtitle[i].hashdate === 0) {
        const titleresult = await getJsonFunc(octokit, `Posts.json`);

        titleresult.posts = titleresult.posts.filter((post: { title: string; }) => post.title !== modtitle[i].title);
        updateFunc(octokit, `Posts.json`, JSON.stringify(titleresult), `Posts.json ${modtitle[i].title} deleted`);
        return ;
      }

      else {
        try {
          const puttitle = await getFunc(octokit, `Posts/Works/${modtitle[i].hashdate}/main.html`);
          let returnString = decodeURIComponent(escape(window.atob(puttitle.data.content)));
          const regex = /images_cap=&lt;&lt;&lt;(.*?)&gt;&gt;&gt;/gs;
          let match;
          const jpegFileNames: string[] = [];
  
          while ((match = regex.exec(returnString)) !== null) {
            const fileNamesStr = match[1];  // 첫 번째 캡처 그룹을 가져옴
            const fileNames = fileNamesStr.split('#$%^');  // 쉼표로 구분된 파일 이름 배열   
            fileNames.forEach(fileName => {
              jpegFileNames.push(fileName.trim());  // 각 파일 이름을 배열에 추가 (trim()으로 앞뒤 공백 제거)
            });
          }
          const array: string[] = ["title.JPEG", "main.html", "titlename.txt"].concat(jpegFileNames);    
          const cnt = array.length;

          for (let j = 0; j < cnt; j++){
            let currentSHA;
            try {
              currentSHA = await getFunc(octokit, `${repo}${modtitle[i].hashdate}/${encodeURIComponent(array[j])}`).then((result: any) => result.data.sha);
              // 성공적으로 SHA 값을 가져온 경우에 대한 로직
              } catch (error) {
                  // 실패한 경우에 대한 예외 처리
                  setFileBlock(false);
                  console.error('Failed to fetch SHA:', error);
                  // 여기서 필요한 추가 작업을 수행할 수 있습니다. 예를 들어, 사용자에게 알림을 표시하거나 다른 처리를 수행할 수 있습니다.
              }
              await octokit.request(
              `DELETE /repos/${import.meta.env.VITE_APP_OWNER}/${import.meta.env.VITE_APP_REPO}/contents/public/Posts/Works/${modtitle[i].hashdate}/${encodeURIComponent(array[j])}`,
              {
                owner: import.meta.env.VITE_APP_OWNER,
                repo: import.meta.env.VITE_APP_REPO,
                path: `${modtitle[i]}/${array[j]}`,
                message : `delete ${modtitle[i].hashdate}/${array[j]}`,
                sha: currentSHA,        
              }
            );
        } 
        }
        catch (error) {
          console.error('Failed to fetch SHA:', error);
        setFileBlock(false);
        }
        const titleresult = await getJsonFunc(octokit, `Posts.json`);
        titleresult.posts = titleresult.posts.filter((post: { title: string; }) => post.title !== modtitle[i].title);
        updateFunc(octokit, `Posts.json`, JSON.stringify(titleresult), `Posts.json ${modtitle[i].title} deleted`);
        setFileBlock(false);
      }
    }
      
    }