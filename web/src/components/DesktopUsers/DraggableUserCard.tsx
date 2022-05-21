import React from 'react'
import getAvatarUrl from "../../utils/getAvatarUrl";
import getNameAndSubName from "../../utils/getNameAndSubName";
import User from "../../models/User";
import {useHistory} from "react-router-dom";
import "./DraggableUserCard.css"

interface Props {
  user: User
}

export default (props: Props) => {
  const history = useHistory()

  const onDragStart = (e: any) => {
    e.dataTransfer.setData("user", JSON.stringify(props.user))
  }

  const onDragOver = (e: any) => {
    e.preventDefault()
  }

  const { name } = getNameAndSubName(props.user)

  return (
    <div
      className="draggable-user-card-wrapper"
      id={props.user.id}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      draggable={true}
      onClick={e => {
        e.preventDefault()
        history.push(`/profile/${props.user.id}`)
      }}
    >
      {/*prevent users from dragging the single avatar image*/}
      <div className="draggable-user-card-avatar" draggable={false}>
        <img className="draggable-user-card-avatar-img" draggable={false} src={getAvatarUrl(props.user)} alt=""/>
      </div>
      <div className="draggable-user-card-name">{name}</div>
    </div>
  )
}
