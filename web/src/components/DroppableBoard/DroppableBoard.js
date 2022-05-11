import React, {useState} from 'react'
import api from '../../api/Api'
import UserProfileCard from "../UserProfileCard/UserProfileCard";
import getAvatarUrl from "../../utils/getAvatarUrl";
import { useMediaQuery } from 'react-responsive'
import {useHotkeys} from "react-hotkeys-hook";
import "./DroppableBoard.css"
import {PencilAltIcon} from "@heroicons/react/solid";

export default (props) => {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 750px)' })
  const circleMargin = 2 // Margin between the edge of the card circle and inner/outer circles
  const outerDiameter = isTabletOrMobile ? 150 : 250; // Need to be equal to width and height in .droppable-board-wrapper
  const innerCirclePercentage = 0.7; // Update all numbers in Animation section
  const outerRadius = outerDiameter / 2;
  const innerRadius = outerDiameter * innerCirclePercentage / 2;
  const cardRadius = (outerRadius - innerRadius) / 2;
  const anglePerCardAsDegree = Math.asin((cardRadius / 2) / (cardRadius + innerRadius)) * 4 * (180 / 3.14)
  const cardNumber = Math.floor(360 / anglePerCardAsDegree);
  const finalAnglePerCardAsDegree = 360 / cardNumber

  const [circleName, updateCircleName] = useState(props.circleName)
  const [renamingCircle, updateRenamingCircle] = useState(false)
  const [renameCircleLoading, updateRenameCircleLoading] = useState(false)
  const [members, updateCards] = useState(props.members)
  const [modalOpened, updateModalOpened] = useState(false)
  const [deleteCircleClicked, updateDeleteCircleClicked] = useState(false)

  let animationIntervalId = null;
  const circleAnimation = (circleId, card_id, avatar_url) => {
    const avatar = document.getElementById(`${circleId}-temp-card-avatar`)
    avatar.src = avatar_url

    let elem = document.getElementById(`${circleId}-temp-card`);
    let degree = 1;
    let stepCount = 0;
    let finalDegree = 360 - finalAnglePerCardAsDegree * (members.length + 1)
    clearInterval(animationIntervalId);
    animationIntervalId = setInterval(frame, 10);

    function frame() {
      if (degree >= finalDegree || members.length >= cardNumber) {
        elem.style.visibility = "hidden"
        updateCards([...members, {id: card_id, avatar_url}])
        clearInterval(animationIntervalId);
      } else {
        elem.style.visibility = "visible"
        degree = finalDegree * easeInOutCubic(stepCount)
        stepCount += 0.02;
        const top = Math.abs((innerRadius + cardRadius) * Math.cos(degree * 3.14 / 180) - outerRadius + cardRadius)
        const left = Math.abs((innerRadius + cardRadius) * Math.sin(degree * 3.14 / 180) - outerRadius + cardRadius)
        elem.style.top = top + 'px';
        elem.style.left = left + 'px';
      }
    }

    function easeInOutCubic(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
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
      document.getElementById(`${props.circleId}-inner-circle`).animate(
        [
          {transform: `scale(${innerCirclePercentage})`},
          {transform: 'scale(1)'},
        ], options);
    } else {
      document.getElementById(`${props.circleId}-inner-circle`).animate(
        [
          {transform: 'scale(1)'},
          {transform: `scale(${innerCirclePercentage})`},
        ], options);
    }
  }
  const tempCard = (circleId) => {
    const currentCardAngleAsDegree = 0
    const top = Math.abs((innerRadius + cardRadius) * Math.cos(currentCardAngleAsDegree * 3.14 / 180) - outerRadius + cardRadius)
    const left = Math.abs((innerRadius + cardRadius) * Math.sin(currentCardAngleAsDegree * 3.14 / 180) - outerRadius + cardRadius)
    return (
      <div
        key="temp-card"
        id={`${circleId}-temp-card`}
        className="droppable-board-member-card-wrapper temp-card"
        style={{
          top: `${top + circleMargin}px`,
          left: `${left + circleMargin}px`,
          width: `${cardRadius * 2 - circleMargin * 2}px`,
          height: `${cardRadius * 2 - circleMargin * 2}px`,
          visibility: "hidden",
        }}>
        <img
          id={`${circleId}-temp-card-avatar`}
          className="droppable-board-member-card-avatar-img"
          alt=""
        />
      </div>
    )
  }
  const circleColor = (circleId) => {
    const colorMap = [
      "rgb(133, 173, 255)", "rgb(255,133,133)", "rgb(190,133,255)", "rgb(255,186,133)",
      "rgb(255,227,97)", "rgb(133,201,188)", "rgb(158,238,158)", "rgb(77,170,255)",
    ] // Color for all inner circles
    const colorCount = colorMap.length
    let hashValue = 0
    for (let i = 0; i < circleId.length; i++) hashValue += circleId.charCodeAt(i);

    return colorMap[hashValue % colorCount]
  }
  const onDrop = async e => {
    e.preventDefault();
    const card_id = e.dataTransfer.getData("card_id")
    const avatarUrl = e.dataTransfer.getData("avatar_url")
    try {
      await api.addToCircle(props.circleId, card_id)
      innerCircleScale(false, 0)
      circleAnimation(props.circleId, card_id, avatarUrl)
      innerCircleScale(true, 900)
    } catch (e) {
      if (e.response.status === 409) {
        alert(`${card_id} is already in this circle.`)
      } else {
        alert("Something went wrong, please try again later >_<")
      }
    }
  }

  // can't be controlled by using css property :hover
  const onMouseEnter = e => {
    e.preventDefault();
    innerCircleScale(false, 0)
  }

  const onMouseLeave = e => {
    e.preventDefault();
    innerCircleScale(true, 0)
  }

  const onDragOver = e => {
    e.preventDefault();
  }

  const onDragLeave = e => {
    e.preventDefault();
  }

  const onClick = async () => {
    updateModalOpened(true)
  }

  const memberCards = () => {
    let memberCardElements = []
    for (let i = 0; i < members.length && i < cardNumber; i++) {
      const member = members[i]
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
          <img
            className="droppable-board-member-card-avatar-img"
            src={getAvatarUrl(member)}
            alt=""
          />
        </div>)
    }
    return memberCardElements
  }
  const memberModalCards = () => {
    let memberModalCardElements = []
    for (let i = 0; i < members.length; i++) {
      const member = members[i]
      memberModalCardElements.push(
        <UserProfileCard
          key={i}
          user={member}
          circleId={props.circleId}
        />)
    }
    return memberModalCardElements
  }

  // Close the modal when user clicks outside it
  window.onclick = function (event) {
    let modal = document.getElementById("droppable-board-modal-wrapper");
    if (event.target === modal) {
      // reload the page in case user removed people from their circle
      window.location.reload()
    }
  }

  const deleteCircleButtonOnClick = async () => {
    if (!deleteCircleClicked) {
      // ask user to confirm
      updateDeleteCircleClicked(true)
    } else {
      // actually delete the circle
      await api.deleteCircle(props.circleId)
      window.location.reload()
    }
  }

  const renameCircle = async () => {
    updateRenamingCircle(false)
    updateRenameCircleLoading(true)
    await api.renameCircle(props.circleId, circleName)
    updateCircleName(circleName)
    updateRenameCircleLoading(false)
  }

  useHotkeys('enter', async () => {
    if (renamingCircle) {
      await renameCircle()
    }
  }, {
    enableOnTags: ['INPUT']
  })

  const onCircleEditingDone = async () => {
    if (renamingCircle) {
      await renameCircle()
    }
    window.location.reload()
  }

  const onCircleRenameClick = () => {
    if (renameCircleLoading) {
      return
    }
    updateRenamingCircle(true)
  }

  return (
    <div className="droppable-board-wrapper">
      {modalOpened ?
        <div id="droppable-board-modal-wrapper" className="droppable-board-modal-wrapper">
          <div className="droppable-board-modal-content">
            {
              !renamingCircle ?
                <div className="droppable-board-modal-circle" onClick={onCircleRenameClick}>
                  <div className="droppable-board-modal-circle-name">{circleName}</div>
                  <div className="droppable-board-modal-circle-rename-icon">
                    <PencilAltIcon />
                  </div>
                </div>
                :
                <input
                  className="droppable-board-modal-circle-name droppable-board-modal-circle-rename"
                  type="text"
                  value={circleName}
                  onChange={e => updateCircleName(e.target.value)}
                />
            }

            <div className="droppable-board-modal-circle-members">
              {memberModalCards()}
            </div>
            <div className="droppable-board-modal-buttons">
              <div className="droppable-board-modal-button-delete" onClick={deleteCircleButtonOnClick}>
                {deleteCircleClicked ? "Confirm Delete Circle" : "Delete Circle"}
              </div>
              <div className="droppable-board-modal-button-done" onClick={onCircleEditingDone}>
                Done
              </div>
            </div>
          </div>
        </div> : null}
      <div
        className="droppable-board"
        id={props.id}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <div className="droppable-board-member-cards-wrapper">
          {tempCard(props.circleId)}
          {memberCards()}
        </div>
        <div className="droppable-board-inner-circle"
             id={`${props.circleId}-inner-circle`}
             style={{backgroundColor: circleColor(props.circleId)}}>
          <div className="droppable-board-inner-circle-name">
            {circleName}
          </div>
          <div className="droppable-board-inner-circle-follow-number">
            {members.length}
          </div>
        </div>
      </div>
    </div>
  )
}
