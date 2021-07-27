import React, {Component} from 'react'
import "./Circles.css"
import DraggableUserProfileCards from "../../components/DraggableUserProfileCards/DraggableUserProfileCards";
import CircleBoards from "../../components/CircleBoards/CircleBoards";

export default () => {
  const circleData = [
    {
      name: "circle 1",
      members: [{id: "user1"}, {id: "user2"}, {id: "user4"}]
    },
    {
      name: "circle 2",
      members: [{id: "user5"}, {id: "user2"}, {id: "user4"}]
    },
    {
      name: "circle 3",
      members: [{id: "user5"}, {id: "user4"}, {id: "user3"}]
    },
    {
      name: "circle 4",
      members: [{id: "user5"}, {id: "user4"}, {id: "user3"}]
    },
    {
      name: "circle 5",
      members: [{id: "user5"}, {id: "user4"}, {id: "user3"}]
    },
    {
      name: "circle 6",
      members: [{id: "user5"}, {id: "user4"}, {id: "user3"}]
    },
    {
      name: "circle 7",
      members: [{id: "user5"}, {id: "user4"}, {id: "user3"}]
    },
  ]
  const userProfileData = [{id: "user1"}, {id: "user2"}, {id: "user3"}, {id: "user4"}, {id: "user5"}, {id: "user6"}, {id: "user7"}]
  return (
    <div className="circle-wrapper">
      <DraggableUserProfileCards userProfileData={userProfileData}/>
      <CircleBoards circleData={circleData}/>
    </div>
    // <div>
    //   <div className="circle-user-profile-wrapper">
    //     <DraggableCard id="card1" draggable={true}>
    //       card1
    //     </DraggableCard>
    //   </div>
    //   <div className="circle-circle-wrapper">
    //     <DroppableBoard id="circle">
    //       board1
    //       <DraggableCard id="card2" draggable={true}>
    //         card2
    //       </DraggableCard>
    //     </DroppableBoard>
    //     <DroppableBoard id="circle">
    //       board2
    //     </DroppableBoard>
    //   </div>
    // </div>
  )

}
