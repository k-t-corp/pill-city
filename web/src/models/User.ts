import MediaUrlV2 from "./MediaUrlV2";

export default interface User {
  id: string
  created_at_seconds: number
  avatar_url_v2?: MediaUrlV2
  profile_pic: string,
  display_name?: string
}
