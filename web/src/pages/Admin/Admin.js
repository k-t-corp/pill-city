import React, {useEffect, useState} from 'react'
import './Admin.css'

export default (props) => {
  const [invitationCodes, updateInvitationCodes] = useState([])

  useEffect(async () => {
    const invitationCodes = await props.api.getInvitationCodes()
    updateInvitationCodes(invitationCodes)
  }, [])

  return (
    <div className='admin-page'>
      {invitationCodes.map((ic, i) => {
        return (
          <p key={i} style={{
            textDecoration: ic.claimed ? 'line-through' : null
          }}>{ic.code}</p>
        )
      })}
      <button onClick={async (e) => {
        e.preventDefault()
        await props.api.createInvitationCode()
        window.location.reload()
      }}>Make a new invitation code</button>
    </div>
  )
}
