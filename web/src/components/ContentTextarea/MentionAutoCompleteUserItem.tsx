import React from "react";
import User from "../../models/User";
import './MentionAutoCompleteUserItem.css'

interface Props {
  selected: boolean
  entity: User
}

export default (props: Props) => {
  return (
    <div className='mention-auto-complete-user-item'>{props.entity.display_name} @{props.entity.id}</div>
  )
}
