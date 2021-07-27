import React from 'react'
import "./CircleBoards.css"
import DroppableBoard from "../DroppableBoard/DroppableBoard";

export default (props) => {
  let circles = []
  for (let i = 0; i < props.circleData.length; i++) {
    const circle = props.circleData[i]
    circles.push(<DroppableBoard key={i} circleName={circle.name} members={circle.members}/>)
  }
  return (
    <div className="circle-boards-wrapper">
      <div className="circle-boards">
        {circles}
      </div>
    </div>
  )
}
