import React from 'react'
import "./DraggableUserProfileCards.css"
import DraggableCard from "../DraggableCard/DraggableCard";

export default (props) => {
  let cards = []
  for (let i = 0; i < props.userProfileData.length; i++) {
    const user = props.userProfileData[i]
    cards.push(<DraggableCard key={i} id={user.id} user_id={user.id}/>)
  }
  return (
    <div className="draggable-card-grid-container">
      {cards}
    </div>
  )
}
