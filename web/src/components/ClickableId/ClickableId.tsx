import React from 'react'
import User from "../../models/User";
import {useHistory} from "react-router-dom";
import './ClickableId.css'
import getNameAndSubName from "../../utils/getNameAndSubName";

interface Props {
  user: User | null
}

const ClickableId = (props: Props) => {
  const history = useHistory()
  const { user } = props

  const { name, subName } = getNameAndSubName(props.user)

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
      <span>{name}</span>
      {' '}
      {subName && <span className='clickable-id-subtext'>{`@${subName}`}</span>}
    </span>
  )
}

export default ClickableId
