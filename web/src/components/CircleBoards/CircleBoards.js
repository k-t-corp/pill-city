import React from 'react'
import DroppableBoard from "../DroppableBoard/DroppableBoard";
import AddNewCircleButton from "../AddNewCircleButton/AddNewCircleButton";
import "./CircleBoards.css"

export default (props) => {
  let circles = [<AddNewCircleButton key="new-circle-button"/>]
  for (let i = 0; i < props.circleData.length; i++) {
    const circle = props.circleData[i]
    circles.push(
      <DroppableBoard
        key={i}
        circleId={circle.id}
        circleName={circle.name}
        members={circle.members}
      />
    )
  }
  return (
    <div className="circle-boards-wrapper">
      <div className="circle-boards">
        {circles}
      </div>
    </div>
  )
}
