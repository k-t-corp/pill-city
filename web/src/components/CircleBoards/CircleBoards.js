import React from 'react'
import "./CircleBoards.css"
import DroppableBoard from "../DroppableBoard/DroppableBoard";
import AddNewCircleButton from "../AddNewCircleButton/AddNewCircleButton";

export default (props) => {
  let circles = [<AddNewCircleButton key="new-circle-button" api={props.api}/>]
  for (let i = 0; i < props.circleData.length; i++) {
    const circle = props.circleData[i]
    circles.push(
      <DroppableBoard
      key={i}
      circleName={circle.name}
      members={circle.members}
      api={props.api}
      />)
  }
  return (
    <div className="circle-boards-wrapper">
      <div className="circle-boards">
        {circles}
      </div>
    </div>
  )
}
