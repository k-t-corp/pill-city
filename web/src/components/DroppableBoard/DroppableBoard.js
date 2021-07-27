import React, {useState} from 'react'
import "./DroppableBoard.css"

export default (props) => {
  const circleMargin = 2 // Margin between the edge of the card circle and inner/outer circles
  const outerDiameter = 250; // Need to be equal to width and height in .droppable-board-wrapper
  const innerCirclePercentage = 0.65; // Update all numbers in Animation section
  const outerRadius = outerDiameter / 2;
  const innerRadius = outerDiameter * innerCirclePercentage / 2;
  const cardRadius = (outerRadius - innerRadius) / 2;
  const anglePerCardAsDegree = Math.asin((cardRadius / 2) / (cardRadius + innerRadius)) * 4 * (180 / 3.14)
  const cardNumber = Math.floor(360 / anglePerCardAsDegree);
  const finalAnglePerCardAsDegree = 360 / cardNumber

  const [members, updateCards] = useState(props.members)
  const [dragOverAnimationTriggered, updateDragOverAnimationTriggered] = useState(false)

  let animationIntervalId = null;
  const circleAnimation = (circleName, card_id) => {
    let elem = document.getElementById(`${circleName}-temp-card`);
    elem.style.visibility = "visible"
    let degree = 1;
    let finalDegree = 360 - finalAnglePerCardAsDegree * members.length
    clearInterval(animationIntervalId);
    animationIntervalId = setInterval(frame, 10);
    function frame() {
      if (degree >= finalDegree || members.length >= cardNumber) {
        elem.style.visibility = "hidden"
        updateCards([...members, {id: card_id}])
        clearInterval(animationIntervalId);
      } else {
        degree = degree * 1.1;
        const top = Math.abs((innerRadius + cardRadius) * Math.cos(degree * 3.14 / 180) - outerRadius + cardRadius)
        const left = Math.abs((innerRadius + cardRadius) * Math.sin(degree * 3.14 / 180) - outerRadius + cardRadius)
        elem.style.top = top + 'px';
        elem.style.left = left + 'px';
      }
    }
  }

  const tempCard = (circleName) => {
    const currentCardAngleAsDegree = 0
    const top = Math.abs((innerRadius + cardRadius) * Math.cos(currentCardAngleAsDegree * 3.14 / 180) - outerRadius + cardRadius)
    const left = Math.abs((innerRadius + cardRadius) * Math.sin(currentCardAngleAsDegree * 3.14 / 180) - outerRadius + cardRadius)
    return (
      <div
        key="temp-card"
        id={`${circleName}-temp-card`}
        className="droppable-board-member-card-wrapper temp-card"
        style={{
          top: `${top + circleMargin}px`,
          left: `${left + circleMargin}px`,
          width: `${cardRadius * 2 - circleMargin * 2}px`,
          height: `${cardRadius * 2 - circleMargin * 2}px`,
          visibility: "hidden",
        }}>
        <img className="droppable-board-member-card-avatar-img" src={`${process.env.PUBLIC_URL}/kusuou.PNG`} alt=""/>
      </div>)
  }

  const onDrop = e => {
    e.preventDefault();
    const card_id = e.dataTransfer.getData("card_id")
    circleAnimation(props.circleName, card_id)
    if (dragOverAnimationTriggered) {
      document.getElementById(`${props.circleName}-inner-circle`).animate(
        [
          { transform: `scale(${innerCirclePercentage})` },
          { transform: 'scale(1)' },
        ], {
          fill: 'both',
          easing: "cubic-bezier(0.42, 0, 0.58, 1)",
          duration: 400,
          delay: 700
        });
      updateDragOverAnimationTriggered(false)
    }
  }

  const onDragOver = e => {
    console.log("drag over")
    e.preventDefault();

    if (!dragOverAnimationTriggered) {
      document.getElementById(`${props.circleName}-inner-circle`).animate(
        [
          { transform: 'scale(1)' },
          { transform: `scale(${innerCirclePercentage})` }
        ], {
          fill: 'both',
          easing: "cubic-bezier(0.42, 0, 0.58, 1)",
          duration: 400
        });
      updateDragOverAnimationTriggered(true)
    }
  }

  const onDragLeave = e => {
    e.preventDefault();
    if (dragOverAnimationTriggered) {
      document.getElementById(`${props.circleName}-inner-circle`).animate(
        [
          { transform: `scale(${innerCirclePercentage})` },
          { transform: 'scale(1)' },
        ], {
          fill: 'both',
          easing: "cubic-bezier(0.42, 0, 0.58, 1)",
          duration: 400
        });
      updateDragOverAnimationTriggered(false)
    }
  }

  const memberCards = () => {
    let memberCardElements = []
    for (let i = 0; i < members.length && i < cardNumber; i++) {
      const currentCardAngleAsDegree = -(i + 1) * finalAnglePerCardAsDegree
      const top = Math.abs((innerRadius + cardRadius) * Math.cos(currentCardAngleAsDegree * 3.14 / 180) - outerRadius + cardRadius)
      const left = Math.abs((innerRadius + cardRadius) * Math.sin(currentCardAngleAsDegree * 3.14 / 180) - outerRadius + cardRadius)
      memberCardElements.push(
        <div
          key={i}
          className="droppable-board-member-card-wrapper"
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
      onDragLeave={onDragLeave}
      className="droppable-board-wrapper"
    >
      <div className="droppable-board-member-cards-wrapper">
        {tempCard(props.circleName)}
        {memberCards()}
      </div>
      <div className="droppable-board-inner-circle" id={`${props.circleName}-inner-circle`}>
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
