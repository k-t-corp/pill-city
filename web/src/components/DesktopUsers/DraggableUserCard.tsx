import React, {useState} from 'react'
import getNameAndSubName from "../../utils/getNameAndSubName";
import User from "../../models/User";
import {useHistory} from "react-router-dom";
import "./DraggableUserCard.css"
import api from "../../api/Api";
import {UserRemoveIcon} from "@heroicons/react/solid";
import {UserAddIcon} from "@heroicons/react/outline";
import AvatarV2 from "../MediaV2/AvatarV2";

interface Props {
  user: User
  isFollowing: boolean
  updateFollowing: (f: boolean) => void
}

const DraggableUserCard = (props: Props) => {
  const { user, isFollowing, updateFollowing } = props
  const { name } = getNameAndSubName(props.user)
  const [loading, updateLoading] = useState(false)

  const history = useHistory()

  const onDragStart = (e: any) => {
    e.dataTransfer.setData("user", JSON.stringify(props.user))
  }

  const onDragOver = (e: any) => {
    e.preventDefault()
  }

  return (
    <div
      className="draggable-user-card-wrapper"
      id={props.user.id}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      draggable={true}
      onClick={e => {
        e.preventDefault()
        history.push(`/profile/${props.user.id}`)
      }}
    >
      {/*prevent users from dragging the single avatar image*/}
      <div className="draggable-user-card-left" draggable={false}>
        <div className="draggable-user-card-avatar" draggable={false}>
          <AvatarV2 className="draggable-user-card-avatar-img" draggable={false} user={props.user}/>
        </div>
        <div className="draggable-user-card-name">{name}</div>
      </div>
      <div className='draggable-user-card-buttons'>
        <div
          className={
            !loading ?
              "draggable-user-card-button" :
              "draggable-user-card-button draggable-user-card-button-disabled"
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

export default DraggableUserCard
