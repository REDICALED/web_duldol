import { getFunc, updateFunc, createFunc, createImage } from "@/components/Git/GitFunc";
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
    console.log("resizeFile");
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
    console.log("resizetitleFile");
    }
  );

  //getdiff /path
  export const getDiff = async (path:any) => {
    const octokit = new Octokit({
      auth: import.meta.env.VITE_APP_TOKEN,
    }); 
    console.log("getdiff");
    const result = await updateFunc(octokit, "diff/diff.txt", Date.now() ,path);
    console.log(result.status);
  };
  
  //파일 수정 /repo, path, contents
  export const fileWrite = async (repo:any, path:any, contents:any, setFileBlock:any) => {
    // const octokit = new Octokit({
    //   auth: import.meta.env.VITE_APP_TOKEN,
    // }); 

    // const result = await updateFunc(octokit, `${repo}/${path}/sub.txt`, `${contents}`, path);
    // console.log(result.status);
    setFileBlock(true);
    console.log(repo, path, contents);
    console.log('not yet ..');
    setFileBlock(false);
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
      console.log(path);
      // path가 비어 있으면 모달을 표시
      setTitleRequire(true);
      return;
    }
  
    setFileBlock(true);
    //sub.txt add
    const tmpPath = untitled ? "untitled" : `${path}`;
    const pathkey = Date.now();
    const result = await createFunc(octokit, `${repo}/${pathkey}-${tags}-${tmpPath}/sub.txt`, `${fileList?.length}\n${contents}`, path);
    console.log("create sub.txt put request:" + result.status);
    //titlelist add
    const titleresult = await getFunc(octokit, `${repo}/titlelist.txt`);
    let tmp = decodeURIComponent(escape(window.atob(titleresult.data.content))) + `${pathkey}` + "-" + `${tags}` + "-"  + `${tmpPath}` + ","; 
    const puttitle = await updateFunc(octokit, `${repo}/titlelist.txt`, tmp, path);
    console.log("fix titlelist.txt put request:" + puttitle.status);
    //sub.txt 생성, titlelist.txt에 추가
    
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
    const puttitle = await updateFunc(octokit, `${repo}/mainlist.txt`, mainlist, 'mainlist updated');
    console.log(puttitle.status);
    setFileBlock(false);
  };

  //파일 지우기
  export const fileDelete = async (repo:any, modifyprojecttitle:any, setFileBlock:any) => {
    setFileBlock(true);
    console.log(modifyprojecttitle);
    const octokit = new Octokit({
      auth: import.meta.env.VITE_APP_TOKEN,
    });
    for (let i = 0; i < modifyprojecttitle.length; i++) {
      const array: string[] = ["title.jpg", "sub.txt"];
      for (let i = 0; i <= 20; i++) {
          array.push(`${i}image.jpg`);
      }
      const titleresult = await getFunc(octokit, `${repo}/${modifyprojecttitle[i]}/sub.txt`);
      let tmp = decodeURIComponent(escape(window.atob(titleresult.data.content)));
      const cnt = parseInt(tmp.split('\n')[0], 10);
      console.log(cnt);
      for (let j = 0; j < cnt + 2; j++){
        let currentSHA;
        try {
          currentSHA = await getFunc(octokit, `${repo}/${modifyprojecttitle[i]}/${array[j]}`).then((result: any) => result.data.sha);
          // 성공적으로 SHA 값을 가져온 경우에 대한 로직
          } catch (error) {
              // 실패한 경우에 대한 예외 처리
              setFileBlock(false);
              console.error('Failed to fetch SHA:', error);
              // 여기서 필요한 추가 작업을 수행할 수 있습니다. 예를 들어, 사용자에게 알림을 표시하거나 다른 처리를 수행할 수 있습니다.
          }
          const result = await octokit.request(
          `DELETE /repos/${import.meta.env.VITE_APP_OWNER}/${import.meta.env.VITE_APP_REPO}/contents/public/${repo}/${modifyprojecttitle[i]}/${array[j]}`,
          {
            owner: import.meta.env.VITE_APP_OWNER,
            repo: import.meta.env.VITE_APP_REPO,
            path: `${modifyprojecttitle[i]}/${array[j]}`,
            message : "delete!!",
            sha: currentSHA,        
          }
        );
        const titleresult = await getFunc(octokit, `${repo}/titlelist.txt`);
        let tmp = decodeURIComponent(escape(window.atob(titleresult.data.content)))
        .replace(`${modifyprojecttitle[i]},`, "") // 쉼표와 함께 삭제
        .replace(`${modifyprojecttitle[i]}`, ""); // 쉼표 없이 삭제
        const puttitle = await updateFunc(octokit, `${repo}/titlelist.txt`, tmp, `${modifyprojecttitle[i]} deleted`);        
        console.log("fix titlelist.txt, delete request:" + puttitle.status );
        console.log(result);
    }
    }
    setFileBlock(false);
    console.log("delete done");
  };