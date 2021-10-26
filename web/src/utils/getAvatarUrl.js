import { isObjectLike, isString } from "lodash";

export default (user) => {
  if (
    isObjectLike(user) &&
    isString(user.avatar_url) &&
    user.avatar_url.length > 0
  ) {
    return user.avatar_url
  } else {
    return `${process.env.PUBLIC_URL}/kusuou.png`
  }
}
