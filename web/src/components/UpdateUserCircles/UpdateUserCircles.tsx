import React from "react"
import Circle from "../../models/Circle";
import User from "../../models/User";
import {CheckCircleIcon as CheckCircleIconSolid} from "@heroicons/react/solid";
import {CheckCircleIcon as CheckCircleIconOutline} from "@heroicons/react/outline";

interface Props {
  user: User,
  circles: Circle[]
}

interface UserCircleCardProps {
  user: User,
  circle: Circle
}

const UserCircleCard = (props: UserCircleCardProps) => {
  const {user, circle} = props
  const inCircle = circle.members.map(_ => _.id).indexOf(user.id) !== -1

  return (
    <div>
      <div>{circle.name}</div>
      <div>
        {inCircle ? <CheckCircleIconSolid /> : <CheckCircleIconOutline />}
      </div>
    </div>
  )
}

export default (props: Props) => {
  const {user, circles} = props

  if (circles.length === 0) {
    return <div>Create a circle</div>
  }

  return (
    <div>
      {
        circles.map(c => {
          return (
            <UserCircleCard
              key={c.id}
              user={user}
              circle={c}
            />
          )
        })
      }
    </div>
  )
}
