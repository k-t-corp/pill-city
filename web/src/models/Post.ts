import User from "./User";
import {AnonymizedCircle} from "./Circle";
import Media from "./Media";
import MediaUrlV2 from "./MediaUrlV2";
import LinkPreview from "./LinkPreview";

export interface NestedComment {
  id: string
  created_at_seconds: number
  author: User
  content: string
  deleted: boolean
  media_urls: string[],
  media_urls_v2: MediaUrlV2[]
}

export interface Comment extends NestedComment {
  comments: NestedComment[]
}

export interface Reaction {
  id: string
  emoji: string
  author: User
}

export interface Previewable {
  media_urls: string[]
  media_urls_v2: MediaUrlV2[]
  content: string,
  deleted: boolean
}

export interface ResharedPost extends Previewable {
  id: string
  created_at_seconds: number
  author: User
}

export interface PollChoice {
  id: string,
  content: string,
  media?: Media,
  media_url_v2?: MediaUrlV2
  voters: User[]
}

export interface Poll {
  choices: PollChoice[]
  close_by_seconds: number
}

export default interface Post extends Previewable {
  id: string
  created_at_seconds: number
  author: User
  is_public: boolean
  reshareable: boolean
  reshared_from: ResharedPost | null,
  reactions: Reaction[],
  comments: Comment[],
  circles: AnonymizedCircle[],
  is_update_avatar: boolean
  poll: Poll,
  link_previews: LinkPreview[]
}
