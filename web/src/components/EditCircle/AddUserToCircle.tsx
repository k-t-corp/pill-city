import React from "react";
import './AddUserToCircle.css'
import User from "../../models/User";
import getAvatarUrl from "../../utils/getAvatarUrl";
import getNameAndSubName from "../../utils/getNameAndSubName";

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
        <img className="add-user-to-circle-user-card-avatar-img" src={getAvatarUrl(user)} alt=""/>
      </div>
      <div className='add-user-to-circle-user-card-right'>
        <div className="add-user-to-circle-user-card-name">
          {name}
        </div>
      </div>
    </div>
  )
}

export default (props: Props) => {
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
