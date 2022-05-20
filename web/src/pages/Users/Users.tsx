import React, {useEffect, useState} from 'react'
import {useHistory} from "react-router-dom";
import getAvatarUrl from "../../utils/getAvatarUrl";
import "./Users.css"
import User from "../../models/User";
import getNameAndSubName from "../../utils/getNameAndSubName";
import api from "../../api/Api";
import {UserRemoveIcon} from "@heroicons/react/solid";
import {UserAddIcon} from "@heroicons/react/outline";

type UserWithLoadingState = {
  _follow_loading: boolean,
  is_following: boolean
} & User

const Users = () => {
  const [loading, updateLoading] = useState(true)
  const [users, updateUsers] = useState<UserWithLoadingState[]>([])
  const history = useHistory()

  useEffect(() => {
    (async () => {
      const users = await api.getUsers()
      updateUsers(users.map((u: User) => {
        return {...u, _follow_loading: false}
      }))
      updateLoading(false)
    })()
  }, [])

  let userCardElements = []
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const userCardOnClick = () => {
      history.push(`/profile/${user.id}`)
    }
    const createdAtDate = new Date(user['created_at_seconds'] * 1000)
    const { name, subName } = getNameAndSubName(user)
    userCardElements.push(
      <div className="users-user-card-wrapper" key={i} onClick={userCardOnClick}>
        <div className="users-user-card-avatar">
          <img className="users-user-card-avatar-img" src={getAvatarUrl(user)} alt=""/>
        </div>
        <div className='users-user-card-right'>
          <div>
            <div className="users-user-card-name">{name}</div>
            {subName && <div className="users-user-card-join-time">{`@${subName}`}</div>}
            <div className="users-user-card-join-time">
              Joined on {createdAtDate.toLocaleDateString(undefined, {year: '2-digit', month: 'short', day: 'numeric'})}
            </div>
          </div>
          <div
            className={
              !user._follow_loading ?
                "users-user-card-follow-button" :
                "users-user-card-follow-button users-user-card-follow-button-disabled"
            }
            onClick={async (e) => {
              e.stopPropagation()
              if (user._follow_loading) {
                return
              }
              updateUsers(users.map(u => {
                if (u.id !== user.id) {
                  return u
                }
                return {
                  ...u,
                  _follow_loading: true
                }
              }))
              if (user.is_following) {
                await api.unfollow(user.id)
              } else {
                await api.follow(user.id)
              }
              updateUsers(users.map(u => {
                if (u.id !== user.id) {
                  return u
                }
                return {
                  ...u,
                  is_following: !u.is_following,
                  _follow_loading: false
                }
              }))
            }}
          >
            {
              user.is_following ? <UserRemoveIcon /> : <UserAddIcon />
            }
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='users-wrapper'>
        <div className='users-status'>Loading...</div>
      </div>
    )
  }

  return (
    <div className="users-grid-container">
      {userCardElements}
    </div>
  )
}

export default Users
