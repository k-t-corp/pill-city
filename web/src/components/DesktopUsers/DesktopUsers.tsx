import React from 'react'
import DraggableUserCard from "./DraggableUserCard";
import AddNewCircleButton from "./AddNewCircleButton";
import DroppableCircleBoard from "./DroppableCircleBoard";
import "./DesktopUsers.css"
import User from "../../models/User";
import Circle from "../../models/Circle";

interface Props {
  loading: boolean
  users: User[],
  followings: User[]
  updateFollowings: (v: User[]) => void
  circles: Circle[]
  createCircle: (name: string) => void
  updateCircle: (circle: Circle) => void
  deleteCircle: (circle: Circle) => void
}

const DesktopUsers = (props: Props) => {
  const {loading, users, followings, updateFollowings, circles, updateCircle, deleteCircle} = props

  if (loading) {
    return (
      <div className='desktop-users-wrapper'>
        <div className='desktop-users-status'>Loading...</div>
      </div>
    )
  }

  const circleElements = [
    <AddNewCircleButton
      key={-1}
      onCreate={props.createCircle}
    />
  ]

  for (let c of circles) {
    circleElements.push(
      <DroppableCircleBoard
        key={c.id}
        circle={c}
        updateCircle={updateCircle}
        deleteCircle={() => {
          deleteCircle(c)
        }}
        users={users}
      />
    )
  }

  return (
    <div className='desktop-users-wrapper'>
      <div className='desktop-users-user-cards-container'>
        {users.map((user, i) => {
          return (
            <DraggableUserCard
              key={i}
              user={user}
              isFollowing={followings.map(_ => _.id).indexOf(user.id) !== -1}
              updateFollowing={f => {
                if (f) {
                  updateFollowings([...followings, user])
                } else {
                  updateFollowings(followings.filter(_ => _.id !== user.id))
                }
              }}
            />
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
