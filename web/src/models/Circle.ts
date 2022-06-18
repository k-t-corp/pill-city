import User from "./User";

interface MyCircle {
  id: string
  name: string
}

interface OthersCircle {
  id: string
}

export type AnonymizedCircle = MyCircle | OthersCircle

export default interface Circle {
  id: string
  name: string
  members: User[]
}
