import React from 'react'
import User from "../../models/User";
import {useHistory} from "react-router-dom";
import './ClickableId.css'

interface Props {
  user: User | null
}

export default (props: Props) => {
  const history = useHistory()
  const { user } = props

  let mainText
  let subText
  if (user) {
    if (user.display_name) {
      mainText = user.display_name
      subText = `@${user.id}`
    } else {
      mainText = user.id
      subText = ''
    }
  } else {
    mainText = ''
    subText = ''
  }

  return (
    <span
      style={{cursor: user ? 'pointer' : 'default'}}
      onClick={e => {
        // This component is sometimes nested in other clickable places so need this
        e.stopPropagation()
        if (!user) {
          return
        }
        history.push(`/profile/${user.id}`)
      }}
    >
      <span title={subText}>{mainText}</span>
    </span>
  )
}
