import React from 'react'
import "./DraggableCard.css"

export default (props) => {
  const onDragStart = e => {
    const target = e.target
    e.dataTransfer.setData("card_id", target.id)
  }

  const onDragOver = e => {
    e.preventDefault()
  }

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
        <img className="draggable-card-avatar-img" draggable={false} src={`${process.env.PUBLIC_URL}/kusuou.png`} alt=""/>
      </div>
      <div className="draggable-card-name">
        {props.user_id}
      </div>
    </div>
  )
}
