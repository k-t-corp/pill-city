import User from "./User";
import Media from "./Media";

export default interface MediaSet {
  id: string
  owner: User
  name: string
  media_list: Media[]
  is_public: boolean
}
