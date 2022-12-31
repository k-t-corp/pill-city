import React, {useEffect, useState} from 'react'
import api from "../../api/Api";
import './Admin.css'

const Admin = () => {
  const [invitationCodes, updateInvitationCodes] = useState([])

  useEffect(async () => {
    const invitationCodes = await api.getInvitationCodes()
    updateInvitationCodes(invitationCodes)
  }, [])

  const codeElem = (i, ic) => {
    return (
      <p
        key={i}
        className={`admin-page-code${ic.clicked === true ? " shake-horizontal" : ""}`}
        onClick={async () => {
          await navigator.clipboard.writeText(ic.code)
          updateInvitationCodes(invitationCodes.map(iic => {
            if (iic.code === ic.code) {
              return {
                ...iic, clicked: true
              }
            } else {
              return iic
            }
          }))
        }}
        style={{
          textDecoration: ic.claimed ? 'line-through' : null,
          color: ic.isNewCode ? "#3bc75b" : "#333"
        }}
      >{ic.code}</p>
    )
  }
  return (
    <div className='admin-page'>
      <h1>Invitation Codes</h1>
      <div className="admin-page-button" onClick={async (e) => {
        e.preventDefault()
        const newCode = await api.createInvitationCode()
        updateInvitationCodes([
          {code: newCode, claimed: false, isNewCode: true, clicked: false},
          ...invitationCodes.map(ic => {return {...ic, clicked: false}})
        ])
      }}>Make a new invitation code</div>
      {invitationCodes.map((ic, i) => {
        return (
          codeElem(i, ic)
        )
      })}
      <h2>Cache</h2>
      <div className='admin-page-button' onClick={async (e) => {
        e.preventDefault()
        await api.clearMediaUrlCache()
      }}>Clear media URL cache</div>
    </div>
  )
}

export default Admin
