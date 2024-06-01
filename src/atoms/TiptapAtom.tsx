import { atom } from "recoil";
// import { recoilPersist } from "recoil-persist";

  export const tiptapMainText = atom({
    key: 'tiptapMainText', // unique ID (with respect to other atoms/selectors)
    default: '', // default value (aka initial value)
  });

  export const titapPostDate = atom({
    key: 'titapPostDate', // unique ID (with respect to other atoms/selectors)
    default: '', // default value (aka initial value)
  });

  export const titapPostTitleImage = atom <null | File>({
    key: 'titapPostTitleImage', // unique ID (with respect to other atoms/selectors)
    default: null, // default value (aka initial value)
  });

  export const titapPostTitle = atom({
    key: 'titapPostTitle', // unique ID (with respect to other atoms/selectors)
    default: '', // default value (aka initial value)
  });