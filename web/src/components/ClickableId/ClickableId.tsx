import React from 'react'
import User from "../../models/User";
import {useHistory} from "react-router-dom";

interface Props {
  user: User | null
}

export default (props: Props) => {
  const history = useHistory()

  return (
    <span
      style={{cursor: props.user ? 'pointer' : 'default'}}
      onClick={e => {
        // This component is sometimes nested in other clickable places so need this
        e.stopPropagation()
        if (!props.user) {
          return
        }
        history.push(`/profile/${props.user.id}`)
      }}
    >{props.user ? props.user.id : ''}</span>
  )
}
