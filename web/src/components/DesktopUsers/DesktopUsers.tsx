import React from 'react'
import DraggableUserCard from "./DraggableUserCard";
import AddNewCircleButton from "./AddNewCircleButton";
import DroppableCircleBoard from "./DroppableCircleBoard";
import "./DesktopUsers.css"
import {UsersProps} from "../../pages/Users/common";

const DesktopUsers = (props: UsersProps) => {
  const {loading, users, circles} = props

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
