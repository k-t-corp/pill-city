import User from "./User";
import Circle from "./Circle";
import Media from "./Media";

export interface NestedComment {
  id: string
  created_at_seconds: number
  author: User
  content: string
  deleted: boolean
  media_urls: string[],
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
  media: Media,
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
  circles: Circle[],
  is_update_avatar: boolean
  poll: Poll
}
