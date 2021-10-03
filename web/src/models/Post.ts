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

export default interface Post {
  id: string
  created_at_seconds: number
  author: User
  content: string
  is_public: boolean
  reshareable: boolean
  reshared_from: {
    id: string
    created_at_seconds: number
    author: User
    content: string
    media_urls: string[],
    deleted: boolean
  }
  media_urls: string[],
  reactions: Reaction[],
  comments: Comment[],
  circles: Circle[],
  deleted: boolean
}
