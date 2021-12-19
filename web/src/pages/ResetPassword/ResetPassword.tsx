import HomePage from "../../components/HomePage/HomePage";
import React, {useEffect, useState} from "react";
import './ResetPassword.css'
import api from "../../api/Api";
import {useHistory, useLocation} from "react-router-dom";
import qs from "qs"

const ResetPasswordForm = () => {
  const location = useLocation()
  const history = useHistory()

  const [code, updateCode] = useState((qs.parse(location.search.substring(1))['code'] || '') as string)
  const [newPassword, updateNewPassword] = useState('')
  const [confirmPassword, updateConfirmPassword] = useState('')
  const [resetPasswordLoading, updateResetPasswordLoading] = useState(false)
  const [formValidated, updateFormValidated] = useState(false)
  useEffect(() => {
    if (!code) {
      updateFormValidated(false)
      return
    }
    if (!newPassword) {
      updateFormValidated(false)
      return
    }
    if (newPassword !== confirmPassword) {
      updateFormValidated(false)
      return
    }
    updateFormValidated(true)
  }, [code, newPassword, confirmPassword])

  const resetPassword = async () => {
    updateResetPasswordLoading(true)
    try {
      await api.resetPassword(code, newPassword)
      history.push('/signin')
    } catch (e: any) {
      if (e.message) {
        alert(e.message)
      } else {
        console.error(e)
      }
    } finally {
      updateResetPasswordLoading(false)
    }
  }

  return (
    <div className='reset-password'>
      <h1 className='reset-password-title'>Reset password</h1>
      <input
        className="reset-password-input"
        type="text"
        placeholder="Code"
        value={code}
        onChange={e => updateCode(e.target.value)}
      />
      <input
        className="reset-password-input"
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={e => updateNewPassword(e.target.value)}
      />
      <input
        className="reset-password-input"
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={e => updateConfirmPassword(e.target.value)}
      />
      <div
        className={`reset-password-button${!resetPasswordLoading && formValidated ? '' : ' reset-password-button-disabled'}`}
        onClick={resetPassword}
      >Reset password</div>
    </div>
  )
}

const ResetPassword = () => {
  return (
    <HomePage formElement={<ResetPasswordForm />}/>
  )
}

export default ResetPassword
