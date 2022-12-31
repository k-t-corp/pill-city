import User from "./User";
import {AnonymizedCircle} from "./Circle";
import MediaUrlV2 from "./MediaUrlV2";
import LinkPreview from "./LinkPreview";
import EntityState from "./EntityState";

interface BaseComment {
  id: string
  created_at_seconds: number
  author: User
  content: string
  media_urls_v2: MediaUrlV2[]
  reply_to_comment_id: string
  state: EntityState
}

export type NestedComment = BaseComment

export interface Comment extends BaseComment {
  comments: BaseComment[]
}

export interface Reaction {
  id: string
  emoji: string
  author: User
}

export interface ResharedPost {
  id: string
  created_at_seconds: number
  author: User
  content: string,
  media_urls_v2: MediaUrlV2[]
  poll: Poll | null,
  state: EntityState
}

export interface PollChoice {
  id: string,
  content: string,
  media_url_v2?: MediaUrlV2
  voters: User[]
}

export interface Poll {
  choices: PollChoice[]
  close_by_seconds: number
}

export default interface Post {
  id: string
  created_at_seconds: number
  author: User
  is_public: boolean
  reshareable: boolean
  reshared_from: ResharedPost | null,
  reactions: Reaction[],
  comments: Comment[],
  circles: AnonymizedCircle[],
  media_urls_v2: MediaUrlV2[]
  content: string,
  is_update_avatar: boolean
  poll: Poll | null,
  link_previews: LinkPreview[]
  state: EntityState
}
