import React, {useState} from "react";
import Circle from "../../models/Circle";
import api from "../../api/Api";
import './EditCircle.css'
import PillButtons from "../PillButtons/PillButtons";
import PillButton, {PillButtonVariant} from "../PillButtons/PillButton";
import {TrashIcon} from "@heroicons/react/solid";
import getAvatarUrl from "../../utils/getAvatarUrl";
import User from "../../models/User";
import PillModal from "../PillModal/PillModal";
import AddUserToCircle from "../AddUserToCircle/AddUserToCircle";
import ApiError from "../../api/ApiError";
import {useToast} from "../Toast/ToastProvider";
import getNameAndSubName from "../../utils/getNameAndSubName";

interface MemberCardProps {
  circle: Circle
  user: User
}

const MemberCard = (props: MemberCardProps) => {
  const {circle, user} = props
  const {name} = getNameAndSubName(user)

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
        {name}
      </div>
      {deleteButton()}
    </div>
  )
}

interface Props {
  circle: Circle
  updateCircle: (circle: Circle) => void
  users: User[]
  onClose: () => void
}

export default (props: Props) => {
  const {circle, updateCircle, users, onClose} = props
  const members = circle.members
  const [showingAddUserModal, updateShowingAddUserModal] = useState(false)

  const {addToast} = useToast()

  const memberModalCards = () => {
    if (members.length === 0) {
      return (
        <div className='edit-circle-no-member'>
          No member in circle
        </div>
      )
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

  return (
    <div className="edit-circle-content">
      <div className="edit-circle-members">
        {memberModalCards()}
      </div>
      <PillButtons>
        <PillButton
          text='Delete'
          variant={PillButtonVariant.Neutral}
          onClick={() => {}}
        />
        <PillButton
          text='Rename'
          variant={PillButtonVariant.Neutral}
          onClick={() => {}}
        />
        <PillButton
          text='Add user'
          variant={PillButtonVariant.Neutral}
          onClick={() => {updateShowingAddUserModal(true)}}
        />
        <PillButton
          text='Done'
          variant={PillButtonVariant.Positive}
          onClick={onClose}
        />
      </PillButtons>
      <PillModal
        isOpen={showingAddUserModal}
        onClose={() => {updateShowingAddUserModal(false)}}
        title={`Add user to circle "${circle.name}"`}
      >
        <AddUserToCircle
          users={users.filter(u => circle.members.map(m => m.id).indexOf(u.id) === -1)}
          onAddUser={async (user) => {
            try {
              updateShowingAddUserModal(false)
              await api.addToCircle(circle.id, user.id)
              updateCircle({
                ...circle,
                members: [...members, user]
              })
            } catch (e) {
              if (e instanceof ApiError) {
                addToast(e.message)
              } else {
                addToast("Unknown error")
              }
            }
          }}
        />
      </PillModal>
    </div>
  )
}
