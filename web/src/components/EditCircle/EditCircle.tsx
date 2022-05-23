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
import AddUserToCircle from "./AddUserToCircle";
import ApiError from "../../api/ApiError";
import {useToast} from "../Toast/ToastProvider";
import getNameAndSubName from "../../utils/getNameAndSubName";
import RenameCircle from "./RenameCircle";

interface MemberCardProps {
  user: User
  onDelete: (user: User) => void
}

const MemberCard = (props: MemberCardProps) => {
  const {user, onDelete} = props
  const {name} = getNameAndSubName(user)

  return (
    <div className="edit-circle-member-card-wrapper">
      <div className="edit-circle-member-card-avatar">
        <img className="edit-circle-member-card-avatar-img" src={getAvatarUrl(props.user)} alt=""/>
      </div>
      <div className="edit-circle-member-card-name">
        {name}
      </div>
      <div className="edit-circle-member-card-delete-button" onClick={e => {
        e.preventDefault()
        onDelete(user)
      }}>
        <TrashIcon />
      </div>
    </div>
  )
}

interface Props {
  circle: Circle
  updateCircle: (circle: Circle) => void
  users: User[]
  onClose: () => void
  showAddUser: boolean
}

export default (props: Props) => {
  const {circle, updateCircle, users, onClose, showAddUser} = props
  const members = circle.members
  const [showingAddUserModal, updateShowingAddUserModal] = useState(false)
  const [showingRenameModal, updateShowingRenameModal] = useState(false)

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
          onDelete={async () => {
            updateCircle({
              ...circle,
              members: members.filter(m => m.id !== member.id)
            })
            await api.removeFromCircle(circle.id, member.id)
          }}
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
          onClick={() => {updateShowingRenameModal(true)}}
        />
        {showAddUser && <PillButton
          text='Add user'
          variant={PillButtonVariant.Neutral}
          onClick={() => {updateShowingAddUserModal(true)}}
        />}
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
      <PillModal
        isOpen={showingRenameModal}
        onClose={() => {updateShowingRenameModal(false)}}
        title={`Rename circle "${circle.name}"`}
      >
        <RenameCircle
          circle={circle}
          onUpdate={async (name) => {
            updateCircle({
              ...circle,
              name
            })
            await api.renameCircle(circle.id, name)
            updateShowingRenameModal(false)
          }}
          onClose={() => {updateShowingRenameModal(false)}}
        />
      </PillModal>
    </div>
  )
}
