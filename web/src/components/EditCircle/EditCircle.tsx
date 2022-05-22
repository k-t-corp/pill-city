import React, {useState} from "react";
import Circle from "../../models/Circle";
import api from "../../api/Api";
import './EditCircle.css'
import PillButtons from "../PillButtons/PillButtons";
import PillButton, {PillButtonVariant} from "../PillButtons/PillButton";
import {TrashIcon} from "@heroicons/react/solid";
import getAvatarUrl from "../../utils/getAvatarUrl";
import User from "../../models/User";

interface MemberCardProps {
  circle: Circle
  user: User
}

const MemberCard = (props: MemberCardProps) => {
  const {circle, user} = props

  const [deleted, updateDeleted] = useState(false)
  const [loading, updateLoading] = useState(false)
  const deleteMemberFromCircleOnClick = async () => {
    updateLoading(true)
    await api.removeFromCircle(circle.id, user.id)
    updateLoading(false)
    updateDeleted(true)
  }

  const deleteButton = () => {
    if (deleted) {
      return null
    } else if (loading) {
      return <div className="lds-dual-ring"/>
    } else {
      return (
        <div className="edit-circle-member-card-delete-button" onClick={deleteMemberFromCircleOnClick}>
          <TrashIcon />
        </div>)
    }
  }

  return (
    <div className="edit-circle-member-card-wrapper">
      <div className="edit-circle-member-card-avatar">
        <img className="edit-circle-member-card-avatar-img" src={getAvatarUrl(props.user)} alt=""/>
      </div>
      <div className="edit-circle-member-card-name" style={{textDecoration: deleted ? "line-through" : ""}}>
        {props.user.id}
      </div>
      {deleteButton()}
    </div>
  )
}

interface Props {
  circle: Circle
}

export default (props: Props) => {
  const {circle} = props
  const members = circle.members

  const memberModalCards = () => {
    if (members.length === 0) {
      return <div>No member in circle</div>
    }

    let memberModalCardElements = []
    for (let member of members) {
      memberModalCardElements.push(
        <MemberCard
          key={member.id}
          circle={circle}
          user={member}
        />
      )
    }
    return memberModalCardElements
  }

  const onCircleEditingDone = async () => {
    window.location.reload()
  }

  return (
    <div className="edit-circle-content">
      <div className="edit-circle-members">
        {memberModalCards()}
      </div>
      <PillButtons>
        <PillButton
          text='Delete'
          variant={PillButtonVariant.Neutral}
          onClick={onCircleEditingDone}
        />
        <PillButton
          text='Rename'
          variant={PillButtonVariant.Neutral}
          onClick={() => {}}
        />
        <PillButton
          text='Done'
          variant={PillButtonVariant.Positive}
          onClick={onCircleEditingDone}
        />
      </PillButtons>
    </div>
  )
}
