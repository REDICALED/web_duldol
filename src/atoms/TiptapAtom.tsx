import { atom } from "recoil";
// import { recoilPersist } from "recoil-persist";

  export const tiptapMainText = atom({
    key: 'tiptapMainText', // unique ID (with respect to other atoms/selectors)
    default: '', // default value (aka initial value)
  });
