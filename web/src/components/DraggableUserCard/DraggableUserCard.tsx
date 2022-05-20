import React from 'react'
import getAvatarUrl from "../../utils/getAvatarUrl";
import getNameAndSubName from "../../utils/getNameAndSubName";
import User from "../../models/User";
import "./DraggableUserCard.css"

interface Props {
  user: User
}

export default (props: Props) => {
  const onDragStart = (e: any) => {
    e.dataTransfer.setData("user", JSON.stringify(props.user))
  }

  const onDragOver = (e: any) => {
    e.preventDefault()
  }

  const { name } = getNameAndSubName(props.user)

  return (
    <div
      className="draggable-card-wrapper"
      id={props.user.id}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      draggable={true}
    >
      {/*prevent users from dragging the single avatar image*/}
      <div className="draggable-card-avatar" draggable={false}>
        <img className="draggable-card-avatar-img" draggable={false} src={getAvatarUrl(props.user)} alt=""/>
      </div>
      <div className="draggable-card-name">{name}</div>
    </div>
  )
}
