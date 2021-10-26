import User from "../models/User";

export default (user: User | null): { name: string, subName?: string } => {
  let name
  let subName
  if (user !== null) {
    if (user.display_name) {
      name = user.display_name
      subName = user.id
    } else {
      name = user.id
    }
  } else {
    name = '...'
  }
  return { name, subName }
}
