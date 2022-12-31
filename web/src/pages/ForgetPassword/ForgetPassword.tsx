import HomePage from "../../components/HomePage/HomePage";
import React, {useEffect, useState} from "react";
import './ForgetPassword.css'
import {validateEmail} from "../../utils/validators";
import api from "../../api/Api";

const ForgetPasswordForm = () => {
  const [email, updateEmail] = useState('')
  const [forgetPasswordLoading, updateForgetPasswordLoading] = useState(false)
  const [formValidated, updateFormValidated] = useState(false)
  useEffect(() => {
    if (!validateEmail(email)) {
      updateFormValidated(false)
      return
    }
    updateFormValidated(true)
  }, [email])

  const forgetPassword = async () => {
    updateForgetPasswordLoading(true)
    try {
      await api.forgetPassword(email)
      alert('Your password reset email has been sent. Please follow instructions on the email to reset your password')
    } catch (e: any) {
      if (e.message) {
        alert(e.message)
      } else {
        console.error(e)
      }
    } finally {
      updateForgetPasswordLoading(false)
    }
  }

  return (
    <div className='forget-password'>
      <h1 className='forget-password-title'>Forget password?</h1>
      <input
        className="forget-password-input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => updateEmail(e.target.value)}
      />
      <div
        className={`forget-password-button${!forgetPasswordLoading && formValidated ? '' : ' forget-password-button-disabled'}`}
        onClick={forgetPassword}
      >Send password reset email</div>
    </div>
  )
}

const ForgetPassword = () => {
  return (
    <HomePage formElement={<ForgetPasswordForm />}/>
  )
}

export default ForgetPassword
