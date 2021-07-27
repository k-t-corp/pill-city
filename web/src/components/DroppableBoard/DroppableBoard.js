import React, {useState} from 'react'
import "./DroppableBoard.css"

export default (props) => {
  const circleMargin = 2 // Margin between the edge of the card circle and inner/outer circles
  const outerDiameter = 250; // Need to be equal to width and height in .droppable-board-wrapper
  const innerCirclePercentage = 0.7; // Update all numbers in Animation section
  const outerRadius = outerDiameter / 2;
  const innerRadius = outerDiameter * innerCirclePercentage / 2;
  const cardRadius = (outerRadius - innerRadius) / 2;
  const anglePerCardAsDegree = Math.asin((cardRadius / 2) / (cardRadius + innerRadius)) * 4 * (180 / 3.14)
  const cardNumber = Math.floor(360 / anglePerCardAsDegree);
  const finalAnglePerCardAsDegree = 360 / cardNumber

  const [members, updateCards] = useState(props.members)

  let animationIntervalId = null;
  const circleAnimation = (circleName, card_id) => {
    let elem = document.getElementById(`${circleName}-temp-card`);
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
        elem.style.visibility = "visible"
        degree = degree * 1.1;
        const top = Math.abs((innerRadius + cardRadius) * Math.cos(degree * 3.14 / 180) - outerRadius + cardRadius)
        const left = Math.abs((innerRadius + cardRadius) * Math.sin(degree * 3.14 / 180) - outerRadius + cardRadius)
        elem.style.top = top + 'px';
        elem.style.left = left + 'px';
      }
    }
  }
  const innerCircleScale = (scaleUp, delay) => {
    const options = {
      fill: 'both',
      easing: "cubic-bezier(0.42, 0, 0.58, 1)",
      duration: 400,
      delay: delay
    }

    if (scaleUp) {
      document.getElementById(`${props.circleName}-inner-circle`).animate(
        [
          {transform: `scale(${innerCirclePercentage})`},
          {transform: 'scale(1)'},
        ], options);
    } else {
      document.getElementById(`${props.circleName}-inner-circle`).animate(
        [
          {transform: 'scale(1)'},
          {transform: `scale(${innerCirclePercentage})`},
        ], options);
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
  const circleColor = (circleName) => {
    const colorMap = [
      "rgb(133, 173, 255)", "rgb(255,133,133)", "rgb(190,133,255)", "rgb(255,186,133)",
      "rgb(255,227,97)", "rgb(133,201,188)", "rgb(158,238,158)", "rgb(77,170,255)",
    ]
    const colorCount = colorMap.length
    let hashValue = 0
    for (let i = 0; i < circleName.length; i++) hashValue += circleName.charCodeAt(i);

    return colorMap[hashValue % colorCount]


  }
  const onDrop = e => {
    e.preventDefault();
    const card_id = e.dataTransfer.getData("card_id")
    innerCircleScale(false, 0)
    circleAnimation(props.circleName, card_id)
    innerCircleScale(true, 900)
  }

  const onMouseEnter = e => {
    innerCircleScale(false, 0)
  }

  const onMouseLeave = e => {
    innerCircleScale(true, 0)
  }

  const onDragOver = e => {
    e.preventDefault();
  }

  const onDragLeave = e => {
    e.preventDefault();
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
      className="droppable-board-wrapper"
      id={props.id}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="droppable-board-member-cards-wrapper">
        {tempCard(props.circleName)}
        {memberCards()}
      </div>
      <div className="droppable-board-inner-circle"
           id={`${props.circleName}-inner-circle`}
           style={{backgroundColor: circleColor(props.circleName)}}>
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
