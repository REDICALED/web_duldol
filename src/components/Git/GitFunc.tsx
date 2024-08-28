import axios from "axios";

export const staticGetFunc = async (shapath: any): Promise<string> => {
  try {
    // public 디렉토리에 있는 파일의 URL
    const fileUrl = `/${shapath}/sub.txt`;
    const response = await axios.get(fileUrl);
    return response.data;
  } catch (error) {
    console.error('파일을 불러올 수 없습니다.', error);
    return '';
  }
};

export const getJsonFunc = async (octokit: any, shapath: any) => {
  const result = await octokit.request(
    `GET /repos/${import.meta.env.VITE_APP_OWNER}/${import.meta.env.VITE_APP_REPO}/contents/public/${shapath}`,
    {
      owner: import.meta.env.VITE_APP_OWNER,
      repo: import.meta.env.VITE_APP_REPO,
      path: `${shapath}`,
      headers: {
        'If-None-Match': ''
      }
    }
  );
  const content = decodeURIComponent(escape(window.atob(result.data.content)));
  const jsonData = JSON.parse(content);
  return jsonData;
};


export const getFunc = async (octokit: any, shapath: any) => {
    const result = await octokit.request(
      `GET /repos/${import.meta.env.VITE_APP_OWNER}/${import.meta.env.VITE_APP_REPO}/contents/public/${shapath}`,
      {
        owner: import.meta.env.VITE_APP_OWNER,
        repo: import.meta.env.VITE_APP_REPO,
        path: `${shapath}`,
        headers: {
          'If-None-Match': ''
        }
      }
    );
    return result;
};

export const updateFunc = async (octokit: any, shapath: any, value: any, path: any) => {
    const currentSHA = await getFunc(octokit, `${shapath}`).then((result: any) => result.data.sha);
    const result = await octokit.request(
      `PUT /repos/${import.meta.env.VITE_APP_OWNER}/${import.meta.env.VITE_APP_REPO}/contents/public/${shapath}`,
      {
        owner: import.meta.env.VITE_APP_OWNER,
        repo: import.meta.env.VITE_APP_REPO,
        path: `${path}`,
        message: `value: ${value}, path: ${shapath}`,
        sha: currentSHA,
        committer: {
          name: import.meta.env.VITE_APP_OWNER,
          email: import.meta.env.VITE_APP_EMAIL,
        },
        content: `${window.btoa(unescape(encodeURIComponent(`${value}`)))}`,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    return result;
  };

export const createFunc = async (octokit: any, shapath: any, value: any, path: string) => {
    const result = await octokit.request(
      `PUT /repos/${import.meta.env.VITE_APP_OWNER}/${import.meta.env.VITE_APP_REPO}/contents/public/${shapath}`,
      {
        owner: import.meta.env.VITE_APP_OWNER,
        repo: import.meta.env.VITE_APP_REPO,
        path: `${path}`,
        message: `value: ${value}, path: ${shapath}`,
        committer: {
          name: import.meta.env.VITE_APP_OWNER,
          email: import.meta.env.VITE_APP_EMAIL,
        },
        content: `${window.btoa(unescape(encodeURIComponent(`${value}`)))}`,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    return result;
  };

 export const createImage = async (image: File, shapath: any, name: string) => {
    const reader = new FileReader();
  
    reader.onloadend = async () => {
      const base64encoded = typeof reader.result === 'string' ? reader.result.split(",")[1] : "";
      const apiURL = `https://api.github.com/repos/${import.meta.env.VITE_APP_OWNER}/${import.meta.env.VITE_APP_REPO}/contents/public/${shapath}/${name}.jpg`;
  
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
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    };
  
    reader.readAsDataURL(image);
  };
