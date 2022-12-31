import {persistKey} from "./store";

export const purgeCache = () => {
  // todo: hacky
  window.localStorage.removeItem(`persist:${persistKey}`)
}
