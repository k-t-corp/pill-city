import User from "../../models/User";
import Circle from "../../models/Circle";

export interface UsersProps {
  loading: boolean
  users: User[],
  circles: Circle[]
  followings: User[]
  updateFollowings: (v: User[]) => void
}
