import React, {useState} from 'react'
import "./DroppableBoard.css"

export default (props) => {
  const [members, updateCards] = useState(props.members)
  const onDrop = e => {
    e.preventDefault();
    const card_id = e.dataTransfer.getData("card_id")
    updateCards([...members, {id: card_id}])
  }

  const onDragOver = e => {
    e.preventDefault();
  }

  const memberCards = () => {
    // Unit: px
    const circleMargin = 2 // Margin between the edge of the card circle and inner/outer circles
    const outerDiameter = 250; // Need to be equal to width and height in .droppable-board-wrapper
    const innerCirclePercentage = 0.65; // Update all numbers in Animation section
    const outerRadius = outerDiameter / 2;
    const innerRadius = outerDiameter * innerCirclePercentage / 2;
    const cardRadius = (outerRadius - innerRadius) / 2;
    const anglePerCardAsDegree = Math.asin((cardRadius / 2) / (cardRadius + innerRadius)) * 4 * (180 / 3.14)
    const cardNumber = Math.floor(360 / anglePerCardAsDegree);
    const finalAnglePerCardAsDegree = 360 / cardNumber
    let memberCardElements = []
    for (let i = 0; i < members.length && i < cardNumber; i++) {
      const currentCardAngleAsDegree = - i * finalAnglePerCardAsDegree
      const top = Math.abs((innerRadius + cardRadius) * Math.cos(currentCardAngleAsDegree * 3.14 / 180) - outerRadius + cardRadius)
      const left = Math.abs((innerRadius + cardRadius) * Math.sin(currentCardAngleAsDegree * 3.14 / 180) - outerRadius + cardRadius)
      memberCardElements.push(
        <div className="droppable-board-member-card-wrapper"
             style={{
               top: `${top + circleMargin}px`,
               left: `${left + circleMargin}px`,
               width: `${cardRadius * 2 - circleMargin * 2}px`,
               height: `${cardRadius * 2 - circleMargin * 2}px`,
             }}>
          <img className="droppable-board-member-card-avatar-img" src={`${process.env.PUBLIC_URL}/kusuou.PNG`} alt=""/>
        </div>)
    }
    return memberCardElements
  }
  return (
    <div
      id={props.id}
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="droppable-board-wrapper"
    >
      <div className="droppable-board-member-cards-wrapper">
        {memberCards()}
      </div>
      <div className="droppable-board-inner-circle">
        <div className="droppable-board-inner-circle-name">
          {props.circleName}
        </div>
        <div className="droppable-board-inner-circle-follow-number">
          {members.length}
        </div>
      </div>
    </div>
  )
}
