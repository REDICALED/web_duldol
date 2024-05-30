import { Editor } from "@tiptap/react";
import { atom } from "recoil";
// import { recoilPersist } from "recoil-persist";

export const tiptapMainText = atom({
    key: 'tiptapMainText', // unique ID (with respect to other atoms/selectors)
    default: '', // default value (aka initial value)
  });

export const tiptapPreviewImages = atom({
    key: 'tiptapPreviewImages', // unique ID (with respect to other atoms/selectors)
    default: [] as string[], // default value (aka initial value)
  });

  export const tiptapPreviewImages_Cap = atom({
    key: 'tiptapPreviewImages_Cap', // unique ID (with respect to other atoms/selectors)
    default: [] as string[], // default value (aka initial value)
  });

  export const tiptapEditor = atom<Editor | ((currVal: Editor | null) => Editor | null) | null>({
    key: 'tiptapEditor', // unique ID (with respect to other atoms/selectors)
    default: null, // default value (aka initial value)
  });