import User from "./User";
import Circle from "./Circle";

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

export interface WithContent {
  content: string
}

export interface ResharedPost extends WithContent {
  id: string
  created_at_seconds: number
  author: User
  media_urls: string[],
  deleted: boolean
}

export default interface Post extends WithContent {
  id: string
  created_at_seconds: number
  author: User
  is_public: boolean
  reshareable: boolean
  reshared_from: ResharedPost | null,
  media_urls: string[],
  reactions: Reaction[],
  comments: Comment[],
  circles: Circle[],
  deleted: boolean
}
