import * as React from "react";
import {useHistory} from "react-router-dom";
import User from '../../models/User'
import './RoundAvatar.css'
import AvatarV2 from "../MediaV2/AvatarV2";

interface Props {
  user: User | null
  disableNavigateToProfile?: boolean
}

export default (props: Props) => {
  const history = useHistory()

  return (
    <AvatarV2
      className="round-avatar-img"
      user={props.user}
      style={{
        cursor: props.user !== null ? 'pointer' : 'default'
      }}
      onClick={e => {
        if (props.disableNavigateToProfile) {
          return
        }
        // This component is sometimes nested in other clickable places so need this
        e.stopPropagation()
        if (props.user === null) {
          return
        }
        history.push(`/profile/${props.user.id}`)
      }}
    />
  )
}
