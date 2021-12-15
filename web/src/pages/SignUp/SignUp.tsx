import React, {useEffect, useState} from 'react';
import HomePage from "../../components/HomePage/HomePage";
import withApi from "../../hoc/withApi";
import withNoAuthRedirect from "../../hoc/withNoAuthRedirect";
import api from "../../api/Api";
import "./SignUp.css";
import {validateEmail, validateId, validatePassword} from "../../utils/validators";
import {useHistory} from "react-router-dom";

const LoginForm = () => {
  const [id, updateId] = useState('')
  const [displayName, updateDisplayName] = useState('')
  const [email, updateEmail] = useState('')
  const [password, updatePassword] = useState('')
  const [confirmPassword, updateConfirmPassword] = useState('')
  const [invitationCode, updateInvitationCode] = useState('')
  const [requireInvitationCode, updateRequireInvitationCode] = useState(false)
  const [signUpLoading, updateSignUpLoading] = useState(false)

  const history = useHistory()

  useEffect(() => {
    (async () => {
      const isOpenRegistration = await api.isOpenRegistration()
      updateRequireInvitationCode(!isOpenRegistration)
    })()
  }, [])

  const [formValidated, updateFormValidated] = useState(false)
  useEffect(() => {
    if (!validateId(id)) {
      updateFormValidated(false)
      return
    }
    if (email && !validateEmail(email)) {
      updateFormValidated(false)
      return
    }
    if (!validatePassword(password)) {
      updateFormValidated(false)
      return
    }
    if (password !== confirmPassword) {
      updateFormValidated(false)
      return
    }
    if (requireInvitationCode && !invitationCode) {
      updateFormValidated(false)
      return
    }
    updateFormValidated(true)
  }, [id, displayName, email, password, confirmPassword, invitationCode, requireInvitationCode])

  const signUp = () => {
    if (!formValidated) {
      return
    }
    updateSignUpLoading(true)
    api.signUp(id, displayName, password, invitationCode)
      .then(() => {
        history.push('/signin')
      })
      .catch((e) => {
        if (e.message) {
          alert(e.message)
        } else {
          console.error(e)
        }
      })
      .finally(() => {
        updateSignUpLoading(false)
      })
  }

  return (
    <div className='login-form'>
      <h1 className='login-form-title'>Sign up</h1>
      <input
        className="login-form-input"
        type="text"
        placeholder="* ID, only letters & numbers"
        value={id}
        onChange={e => updateId(e.target.value)}
      />
      <input
        className="login-form-input"
        type="text"
        placeholder="Display name (optional)"
        value={displayName}
        onChange={e => updateDisplayName(e.target.value)}
      />
      <input
        className="login-form-input"
        type="email"
        placeholder="Email (optional for notifications)"
        value={email}
        onChange={e => updateEmail(e.target.value)}
      />
      <input
        className="login-form-input"
        type="password"
        placeholder="* Password"
        value={password}
        onChange={e => updatePassword(e.target.value)}
      />
      <input
        className="login-form-input"
        type="password"
        placeholder="* Confirm password"
        value={confirmPassword}
        onChange={e => updateConfirmPassword(e.target.value)}
      />
      {requireInvitationCode &&
        <input
          className="login-form-input"
          type="text"
          placeholder="* Invitation code"
          value={invitationCode}
          onChange={e => updateInvitationCode(e.target.value)}
        />
      }
      <div
        className={`login-form-button${formValidated ? '' : ' login-form-button-disabled'}`}
        onClick={signUp}
      >Sign up</div>
      <div className="message-box-sign-in">
        Already have an account? <a className="sign-in-link" href='/signin'>Sign in here</a>
      </div>
    </div>
  )
}

const SignUp = () => {
  return (
    <HomePage formElement={<LoginForm />}/>
  )
}

export default withApi(withNoAuthRedirect(SignUp), api)
