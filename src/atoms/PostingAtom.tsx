import { atom } from "recoil";

export const PostGenreType = atom({
    key: 'PostGenreType', // unique ID (with respect to other atoms/selectors)
    default: "memo", // default value (aka initial value)
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

