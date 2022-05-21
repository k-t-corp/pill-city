import React, {useState} from 'react'
import {useHistory} from "react-router-dom";
import getAvatarUrl from "../../utils/getAvatarUrl";
import User from "../../models/User";
import getNameAndSubName from "../../utils/getNameAndSubName";
import api from "../../api/Api";
import {UserRemoveIcon} from "@heroicons/react/solid";
import {UserAddIcon} from "@heroicons/react/outline";
import {UsersProps} from "../../pages/Users/common";
import "./MobileUsers.css"

interface UserCardProps {
  user: User
  isFollowing: boolean
  updateFollowing: (f: boolean) => void
}

const UserCard = (props: UserCardProps) => {
  const { user, isFollowing, updateFollowing } = props
  const { name, subName } = getNameAndSubName(user)
  const createdAtDate = new Date(user['created_at_seconds'] * 1000)

  const [loading, updateLoading] = useState(false)
  const history = useHistory()

  return (
    <div className="mobile-users-user-card-wrapper" onClick={() => {
      history.push(`/profile/${user.id}`)
    }}>
      <div className="mobile-users-user-card-avatar">
        <img className="mobile-users-user-card-avatar-img" src={getAvatarUrl(user)} alt=""/>
      </div>
      <div className='mobile-users-user-card-right'>
        <div>
          <div className="mobile-users-user-card-name">{name}</div>
          {subName && <div className="mobile-users-user-card-join-time">{`@${subName}`}</div>}
          <div className="mobile-users-user-card-join-time">
            Joined on {createdAtDate.toLocaleDateString(undefined, {year: '2-digit', month: 'short', day: 'numeric'})}
          </div>
        </div>
        <div
          className={
            !loading ?
              "mobile-users-user-card-follow-button" :
              "mobile-users-user-card-follow-button mobile-users-user-card-follow-button-disabled"
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
  )
}

export default (props: UsersProps) => {
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
