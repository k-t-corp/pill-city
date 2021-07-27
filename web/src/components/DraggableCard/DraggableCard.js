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
      id={props.id}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      draggable={true}
      className="draggable-card-wrapper"
    >
      <div className="draggable-card-avatar">
        <img className="draggable-card-avatar-img" src={`${process.env.PUBLIC_URL}/kusuou.PNG`} alt=""/>
      </div>
      <div className="draggable-card-name">
        {props.user_id}
      </div>
    </div>
  )
}
