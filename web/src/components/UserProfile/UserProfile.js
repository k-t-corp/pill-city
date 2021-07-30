import React from 'react'
import "./UserProfile.css"

export default (props) => {
  return (
    <div className="user-profile-wrapper">
      <div className="user-profile-user-info">
        <div className="user-profile-banner-wrapper">
          <img className="user-profile-banner-img" alt="user-banner"/>
        </div>
        <div className="user-profile-avatar-wrapper">
          <img className="user-profile-avatar-img" src={`${process.env.PUBLIC_URL}/kusuou.png`} alt="user-avatar"/>
        </div>
        <div className="user-profile-user-name">
          {props.userData.id}
        </div>
        {props.me ?
          // Save this part for later
          // <div className="user-profile-info-button">
          //   Edit profile
          // </div>
          null
          :
          <div>
            Follow
          </div>}
      </div>
    </div>
  )
}
