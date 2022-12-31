import React, {useEffect, useState} from 'react';
import HomePage from "../../components/HomePage/HomePage";
import api from "../../api/Api";
import {validateId, validatePassword} from "../../utils/validators";
import useQuery from "../../utils/useQuery";
import "./SignIn.css"

const SignInForm = () => {
  const query = useQuery();

  const [id, updateId] = useState('')
  const [password, updatePassword] = useState('')
  const [signInLoading, updateSignInLoading] = useState(false)

  const [formValidated, updateFormValidated] = useState(false)
  useEffect(() => {
    if (!validateId(id)) {
      updateFormValidated(false)
      return
    }
    if (!validatePassword(password)) {
      updateFormValidated(false)
      return
    }
    updateFormValidated(true)
  }, [id, password])

  const signIn = async () => {
    if (!formValidated) {
      return
    }
    updateSignInLoading(true)
    try {
      await api.signIn(id, password)
      // window.location.href is needed so that the App component is fully reloaded
      // so that getting the first home page and auto refresh is enabled
      window.location.href = query.get('next') || '/'
    } catch (e: any) {
      if (e.message) {
        alert(e.message)
      } else {
        console.error(e)
      }
    } finally {
      updateSignInLoading(false)
    }
  }

  return (
    <div className='sign-in'>
      <h1 className='sign-in-title'>Sign in</h1>
      <input
        className="sign-in-input"
        type="text"
        placeholder="* ID"
        value={id}
        onChange={e => updateId(e.target.value)}
      />
      <input
        className="sign-in-input"
        type="password"
        placeholder="* Password"
        value={password}
        onChange={e => updatePassword(e.target.value)}
      />
      <div
        className={`sign-in-button${!signInLoading && formValidated ? '' : ' sign-in-button-disabled'}`}
        onClick={signIn}
      >Sign in</div>
      <div className="sign-up-message">
        Don't have an account? <a className="sign-up-link" href='/signup'>Sign up here</a>
      </div>
      <div className="sign-up-message">
        <a className="sign-up-link" href='/forget'>Forget password?</a>
      </div>
    </div>
  )
}

const SignIn = () => {
  return (
    <HomePage formElement={<SignInForm />}/>
  )
}

export default SignIn
