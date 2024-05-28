import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist({
  key: "sessionStorage", //원하는 key 값 입력
  storage: sessionStorage,
})

export const GitRepo = atom({
    key: 'GitRepo', // unique ID (with respect to other atoms/selectors)
    default: "fine", // default value (aka initial value)
  });

  export const GitTag = atom({
    key: 'GitTag', // unique ID (with respect to other atoms/selectors)
    default: "Works", // default value (aka initial value)
  });

export const GitPath = atom({
    key: 'GitPath', // unique ID (with respect to other atoms/selectors)
    default: "", // default value (aka initial value)
  });

  export const GitContents= atom({
    key: 'GitContents', // unique ID (with respect to other atoms/selectors)
    default: "", // default value (aka initial value)
  });

  //화면 우측 프로젝트 fine 리스트 보여주기 용
  export const GitProjectListFine= atom({
    key: 'GitProjectListFine', // unique ID (with respect to other atoms/selectors)
    default: [] as any, // default value (aka initial value)
    effects_UNSTABLE: [persistAtom]
  });

  //화면 우측 프로젝트 fashion 리스트 보여주기 용
  export const GitProjectListFashion= atom({
    key: 'GitProjectListFashion', // unique ID (with respect to other atoms/selectors)
    default: [] as any, // default value (aka initial value)
    effects_UNSTABLE: [persistAtom]
  });

  //화면 우측 프로젝트 실제 담길 tmp리스트
  export const GitProjectListTmp= atom({
    key: 'GitProjectListTmp', // unique ID (with respect to other atoms/selectors)
    default: [] as any, // default value (aka initial value)
  });

  //수정, 삭제할 프로젝트 선택 (delete, modify에 쓰이는 아톰, 선택한 게시물들 리스트로 저장)
  export const GitModifyProjectTitle= atom({
    key: 'GitModifyProjectTitle', // unique ID (with respect to other atoms/selectors)
    default: [] as any, // default value (aka initial value)
  });

    //수정, 삭제할 프로젝트 선택 (delete, modify에 쓰이는 아톰, 선택한 게시물들 리스트로 저장)
  export const GitMainImage= atom({
    key: 'GitMainImage', // unique ID (with respect to other atoms/selectors)
    default: [] as any, // default value (aka initial value)
  });
