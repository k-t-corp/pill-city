import React from "react";
import './AddUserToCircle.css'
import User from "../../models/User";
import getNameAndSubName from "../../utils/getNameAndSubName";
import AvatarV2 from "../MediaV2/AvatarV2";

interface Props {
  users: User[]
  onAddUser: (user: User) => void
}

interface UserCardProps {
  user: User
  onAddUser: (user: User) => void
}

const UserCard = (props: UserCardProps) => {
  const {user, onAddUser} = props
  const { name } = getNameAndSubName(user)

  return (
    <div className="add-user-to-circle-user-card-wrapper" onClick={e => {
      e.preventDefault()
      onAddUser(user)
    }}>
      <div className="add-user-to-circle-user-card-avatar">
        <AvatarV2 className="add-user-to-circle-user-card-avatar-img" user={user} />
      </div>
      <div className='add-user-to-circle-user-card-right'>
        <div className="add-user-to-circle-user-card-name">
          {name}
        </div>
      </div>
    </div>
  )
}

const AddUserToCircle = (props: Props) => {
  const {users, onAddUser} = props

  let userCardElements = []
  for (let user of users) {
    userCardElements.push(
      <UserCard
        key={user.id}
        user={user}
        onAddUser={onAddUser}
      />
    )
  }

  return (
    <div className="add-user-to-circle-grid-container">
      {userCardElements}
    </div>
  )
}

export default AddUserToCircle
