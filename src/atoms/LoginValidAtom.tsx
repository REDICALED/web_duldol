import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist({
  key: "sessionStorage", //원하는 key 값 입력
  storage: sessionStorage,
})

export const LoginValid = atom({
    key: 'LoginValid', // unique ID (with respect to other atoms/selectors)
    default: 0, // default value (aka initial value)
    effects_UNSTABLE: [persistAtom],
  });