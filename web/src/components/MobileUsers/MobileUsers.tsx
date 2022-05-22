import React, {useState} from 'react'
import {useHistory} from "react-router-dom";
import getAvatarUrl from "../../utils/getAvatarUrl";
import User from "../../models/User";
import getNameAndSubName from "../../utils/getNameAndSubName";
import api from "../../api/Api";
import {UserRemoveIcon} from "@heroicons/react/solid";
import {UserAddIcon} from "@heroicons/react/outline";
import {UsersProps} from "../../pages/Users/common";
import CirclesIcon from "../PillIcons/CirclesIcon";
import PillModal from "../PillModal/PillModal";
import "./MobileUsers.css"
import UpdateUserCircles from "../UpdateUserCircles/UpdateUserCircles";
import Circle from "../../models/Circle";

interface UserCardProps {
  user: User
  isFollowing: boolean
  updateFollowing: (f: boolean) => void
  circles: Circle[]
}

const UserCard = (props: UserCardProps) => {
  const { user, isFollowing, updateFollowing, circles } = props
  const { name } = getNameAndSubName(user)

  const [loading, updateLoading] = useState(false)
  const [showingCirclesModal, updateShowingCirclesModal] = useState(false)
  const history = useHistory()

  return (
    <div className="mobile-users-user-card-wrapper" onClick={e => {
      e.stopPropagation()
      history.push(`/profile/${user.id}`)
    }} >
      <div className="mobile-users-user-card-avatar">
        <img className="mobile-users-user-card-avatar-img" src={getAvatarUrl(user)} alt=""/>
      </div>
      <div className='mobile-users-user-card-right'>
        <div className="mobile-users-user-card-name">
          {name}
        </div>
        <div className='mobile-users-user-card-buttons'>
          <div
            className='mobile-users-user-card-button'
            onClick={e => {
              e.stopPropagation()
              updateShowingCirclesModal(true)
            }}
          >
            <CirclesIcon />
          </div>
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
      <PillModal
        isOpen={showingCirclesModal}
        onClose={() => {updateShowingCirclesModal(false)}}
      >
        <UpdateUserCircles
          user={user}
          circles={circles}
        />
      </PillModal>
    </div>
  )
}

export default (props: UsersProps) => {
  const {loading, users, followings, updateFollowings, circles} = props

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
        circles={circles}
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
