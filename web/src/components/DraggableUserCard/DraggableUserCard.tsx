import React from 'react'
import getAvatarUrl from "../../utils/getAvatarUrl";
import getNameAndSubName from "../../utils/getNameAndSubName";
import User from "../../models/User";
import "./DraggableUserCard.css"
import {useHistory} from "react-router-dom";

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
      className="draggable-card-wrapper"
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
      <div className="draggable-card-avatar" draggable={false}>
        <img className="draggable-card-avatar-img" draggable={false} src={getAvatarUrl(props.user)} alt=""/>
      </div>
      <div className="draggable-card-name">{name}</div>
    </div>
  )
}
