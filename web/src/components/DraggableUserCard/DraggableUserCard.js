import React from 'react'
import "./DraggableUserCard.css"
import getAvatarUrl from "../../utils/getAvatarUrl";
import getNameAndSubName from "../../utils/getNameAndSubName";

export default (props) => {
  const onDragStart = e => {
    const target = e.target
    e.dataTransfer.setData("card_id", target.id)
    e.dataTransfer.setData("avatar_url", getAvatarUrl(props.user))
  }

  const onDragOver = e => {
    e.preventDefault()
  }

  const { name } = getNameAndSubName(props.user)

  return (
    <div
      className="draggable-card-wrapper"
      id={props.id}
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
