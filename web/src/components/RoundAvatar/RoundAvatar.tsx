import * as React from "react";
import {useHistory} from "react-router-dom";
import User from '../../models/User'
import getAvatarUrl from '../../api/getAvatarUrl'
import './RoundAvatar.css'

interface Props {
  user: User | null
}

export default (props: Props) => {
  const history = useHistory()

  return (
    <img
      className="round-avatar-img"
      src={getAvatarUrl(props.user)}
      alt=""
      style={{
        cursor: props.user !== null ? 'default' : 'pointer'
      }}
      onClick={() => {
        if (props.user === null) {
          return
        }
        history.push(`/profile/${props.user.id}`)
      }}
    />
  )
}
