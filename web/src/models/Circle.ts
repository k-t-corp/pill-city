import User from "./User";

export default interface Circle {
  id: string
  name: string
  members: User[]
}
