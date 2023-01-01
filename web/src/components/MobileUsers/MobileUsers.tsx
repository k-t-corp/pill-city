import React, {useState} from 'react'
import {useHistory} from "react-router-dom";
import User from "../../models/User";
import getNameAndSubName from "../../utils/getNameAndSubName";
import api from "../../api/Api";
import {UserRemoveIcon} from "@heroicons/react/solid";
import {UserAddIcon} from "@heroicons/react/outline";
import "./MobileUsers.css"
import AvatarV2 from "../MediaV2/AvatarV2";

interface Props {
  loading: boolean
  users: User[],
  followings: User[]
  updateFollowings: (v: User[]) => void
}

interface UserCardProps {
  user: User
  isFollowing: boolean
  updateFollowing: (f: boolean) => void
}

const UserCard = (props: UserCardProps) => {
  const { user, isFollowing, updateFollowing } = props
  const { name } = getNameAndSubName(user)

  const [loading, updateLoading] = useState(false)
  const history = useHistory()

  return (
    <div className="mobile-users-user-card-wrapper" onClick={e => {
      e.stopPropagation()
      history.push(`/profile/${user.id}`)
    }}>
      <div className="mobile-users-user-card-avatar">
        <AvatarV2 className="mobile-users-user-card-avatar-img" user={user}/>
      </div>
      <div className='mobile-users-user-card-right'>
        <div className="mobile-users-user-card-name">
          {name}
        </div>
        <div className='mobile-users-user-card-buttons'>
          <div
            className={
              !loading ?
                "mobile-users-user-card-button" :
                "mobile-users-user-card-button mobile-users-user-card-button-disabled"
            }
            onClick={async (e) => {
              e.stopPropagation()
              if (loading) {
                return
              }
              updateLoading(true)
              if (isFollowing) {
                await api.unfollow(user.id)
              } else {
                await api.follow(user.id)
              }
              updateFollowing(!isFollowing)
              updateLoading(false)
            }}
          >
            {
              isFollowing ? <UserRemoveIcon /> : <UserAddIcon />
            }
          </div>
        </div>
      </div>
    </div>
  )
}

const MobileUsers = (props: Props) => {
  const {loading, users, followings, updateFollowings} = props

  let userCardElements = []
  for (let user of users) {
    userCardElements.push(
      <UserCard
        key={user.id}
        user={user}
        isFollowing={followings.map(_ => _.id).indexOf(user.id) !== -1}
        updateFollowing={f => {
          if (f) {
            updateFollowings([...followings, user])
          } else {
            updateFollowings(followings.filter(_ => _.id !== user.id))
          }
        }}
      />
    )
  }

  if (loading) {
    return (
      <div className='mobile-users-wrapper'>
        <div className='mobile-users-status'>Loading...</div>
      </div>
    )
  }

  return (
    <div className="mobile-users-grid-container">
      {userCardElements}
    </div>
  )
}

export default MobileUsers
