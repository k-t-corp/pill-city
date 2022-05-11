import React, {useState} from 'react'
import api from '../../api/Api'
import getAvatarUrl from "../../utils/getAvatarUrl";
import "./UserProfileCard.css"
import {TrashIcon} from "@heroicons/react/solid";

export default (props) => {
  const [deleted, updateDeleted] = useState(false)
  const [loading, updateLoading] = useState(false)
  const deleteMemberFromCircleOnClick = async () => {
    updateLoading(true)
    await api.removeFromCircle(props.circleId, props.user.id)
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
        <div className="user-profile-card-delete-button" onClick={deleteMemberFromCircleOnClick}>
          <TrashIcon />
        </div>)
    }
  }

  return (
    <div className="user-profile-card-wrapper">
      <div className="user-profile-card-avatar">
        <img className="user-profile-card-avatar-img" src={getAvatarUrl(props.user)} alt=""/>
      </div>
      <div className="user-profile-card-name" style={{textDecoration: deleted ? "line-through" : ""}}>
        {props.user.id}
      </div>
      {deleteButton()}
    </div>
  )
}
