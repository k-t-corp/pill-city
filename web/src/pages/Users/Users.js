import React, {useEffect, useState} from 'react'
import "./Users.css"
import getAvatarUrl from "../../api/getAvatarUrl";

export default (props) => {
  const [users, updateUsers] = useState([])
  useEffect(async () => {
    const users = await props.api.getUsers()
    updateUsers(users.map(u => {
      return {...u, _follow_loading: false}
    }))
  }, [])

  let userCardElements = []
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const userCardOnClick = () => {
      window.location.href = `/profile/${user.id}`
    }
    const createdAtDate = new Date(user['created_at_seconds'] * 1000)
    userCardElements.push(
      <div className="users-user-card-wrapper" key={i} onClick={userCardOnClick}>
        <div className="users-user-card-avatar">
          <img className="users-user-card-avatar-img" src={getAvatarUrl(user)} alt=""/>
        </div>
        <div className='users-user-card-right'>
          <div>
            <div className="users-user-card-name">
              {user.id}
            </div>
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
                await props.api.unfollow(user.id)
              } else {
                await props.api.follow(user.id)
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
              user.is_following ?
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M11 6a3 3 0 11-6 0 3 3 0 016 0zM14 17a6 6 0 00-12 0h12zM13 8a1 1 0 100 2h4a1 1 0 100-2h-4z"/>
                </svg> :
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
            }
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="users-grid-container">
      {userCardElements}
    </div>
  )
}
