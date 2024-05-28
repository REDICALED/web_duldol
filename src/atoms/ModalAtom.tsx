import { atom } from "recoil";

export const FileRequire = atom({
    key: 'FileRequire', // unique ID (with respect to other atoms/selectors)
    default: false, // default value (aka initial value)
  });


export const TitleRequire = atom({
    key: 'TitleRequire', // unique ID (with respect to other atoms/selectors)
    default: false, // default value (aka initial value)
  });

  export const LoginRequire = atom({
    key: 'LoginRequire', // unique ID (with respect to other atoms/selectors)
    default: false, // default value (aka initial value)
  });

  //삭제, 업로드 시에 블락 스우치 역할의 아톰
  export const GitFileBlock= atom({
    key: 'GitFileBlock', // unique ID (with respect to other atoms/selectors)
    default: false, // default value (aka initial value)
  });

  //이미지 확대 시 모달
  export const ImageZoom= atom({
    key: 'ImageZoom', // unique ID (with respect to other atoms/selectors)
    default: '', // default value (aka initial value)
  });