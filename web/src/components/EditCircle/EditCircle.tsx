import React, {useState} from "react";
import {PencilAltIcon} from "@heroicons/react/solid";
import Circle from "../../models/Circle";
import UserProfileCard from "../UserProfileCard/UserProfileCard";
import api from "../../api/Api";

interface Props {
  circle: Circle
}

export default (props: Props) => {
  const {circle} = props
  const members = circle.members

  const [renamingCircle, updateRenamingCircle] = useState(false)
  const [renameCircleLoading, updateRenameCircleLoading] = useState(false)
  const [circleName, updateCircleName] = useState(circle.name)
  const [deleteCircleClicked, updateDeleteCircleClicked] = useState(false)

  const onCircleRenameClick = () => {
    if (renameCircleLoading) {
      return
    }
    updateRenamingCircle(true)
  }

  const memberModalCards = () => {
    let memberModalCardElements = []
    for (let i = 0; i < members.length; i++) {
      const member = members[i]
      memberModalCardElements.push(
        <UserProfileCard
          key={i}
          user={member}
          circleId={circle.id}
        />)
    }
    return memberModalCardElements
  }

  const deleteCircleButtonOnClick = async () => {
    if (!deleteCircleClicked) {
      // ask user to confirm
      updateDeleteCircleClicked(true)
    } else {
      // actually delete the circle
      await api.deleteCircle(circle.id)
      window.location.reload()
    }
  }

  const onCircleEditingDone = async () => {
    if (renamingCircle) {
      await renameCircle()
    }
    window.location.reload()
  }

  const renameCircle = async () => {
    updateRenamingCircle(false)
    updateRenameCircleLoading(true)
    await api.renameCircle(circle.id, circleName)
    updateCircleName(circleName)
    updateRenameCircleLoading(false)
  }

  return (
    <div className="droppable-circle-board-modal-content">
      {!renamingCircle ?
        <div className="droppable-circle-board-modal-circle" onClick={onCircleRenameClick}>
          <div className="droppable-circle-board-modal-circle-name">{circleName}</div>
          <div className="droppable-circle-board-modal-circle-rename-icon">
            <PencilAltIcon/>
          </div>
        </div>
        :
        <input
          className="droppable-circle-board-modal-circle-name droppable-circle-board-modal-circle-rename"
          type="text"
          value={circleName}
          onChange={e => updateCircleName(e.target.value)}
        />
      }
      <div className="droppable-circle-board-modal-circle-members">
        {memberModalCards()}
      </div>
      <div className="droppable-circle-board-modal-buttons">
        <div className="droppable-circle-board-modal-button-delete" onClick={deleteCircleButtonOnClick}>
          {deleteCircleClicked ? "Confirm Delete Circle" : "Delete Circle"}
        </div>
        <div className="droppable-circle-board-modal-button-done" onClick={onCircleEditingDone}>
          Done
        </div>
      </div>
    </div>
  )
}
