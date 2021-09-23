import { isObjectLike, isString } from "lodash";

export default (user) => {
  if (
    isObjectLike(user) &&
    isString(user.profile_pic) &&
    user.profile_pic.length > 0
  ) {
    return `${process.env.PUBLIC_URL}/${user.profile_pic}`
  } else {
    return `${process.env.PUBLIC_URL}/pill1.png`
  }
}
