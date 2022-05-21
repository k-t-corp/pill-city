import React, {useEffect, useState} from 'react'
import api from "../../api/Api";
import User from "../../models/User";
import Circle from "../../models/Circle";
import DraggableUserCard from "./DraggableUserCard";
import AddNewCircleButton from "./AddNewCircleButton";
import DroppableCircleBoard from "./DroppableCircleBoard";
import "./DesktopUsers.css"

const DesktopUsers = () => {
  const [loading, updateLoading] = useState(true)
  const [users, updateUsers] = useState<User[]>([])
  const [circles, updateCircles] = useState<Circle[]>([])

  useEffect(() => {
    (async () => {
      updateLoading(true)
      updateCircles(await api.getCircles())
      updateUsers(await api.getUsers())
      updateLoading(false)
    })()
  }, [])

  if (loading) {
    return (
      <div className='desktop-users-wrapper'>
        <div className='desktop-users-status'>Loading...</div>
      </div>
    )
  }

  const circleElements = [
    <AddNewCircleButton key={-1}/>
  ]

  for (let c of circles) {
    circleElements.push(
      <DroppableCircleBoard key={c.id} circle={c}/>
    )
  }

  return (
    <div className='desktop-users-wrapper'>
      <div className='desktop-users-user-cards-container'>
        {users.map((u, i) => {
          return (
            <DraggableUserCard key={i} user={u}/>
          )
        })}
      </div>
      <div className="desktop-users-boards-wrapper">
        <div className="desktop-users-boards">
          {circleElements}
        </div>
      </div>
    </div>
  )
}

export default DesktopUsers
