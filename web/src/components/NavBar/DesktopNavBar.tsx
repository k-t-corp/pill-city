import React from 'react'
import {useAppSelector} from "../../store/hooks";
import {useHistory, useLocation} from "react-router-dom";
import {HomeIcon, UserCircleIcon, UserGroupIcon} from "@heroicons/react/solid";
import getNameAndSubName from "../../utils/getNameAndSubName";
import RoundAvatar from "../RoundAvatar/RoundAvatar";
import "./NavBar.css"

const handleNavItemActiveClass = (currentPath: string, expectedPath: string) => {
  return currentPath === expectedPath ? "nav-bar-button-active" : ''
}

export default () => {
  const history = useHistory()
  const path = useLocation().pathname

  const me = useAppSelector(state => state.me.me)

  return (
    <div className="nav-bar-container nav-bar-top" onClick={() => {window.scrollTo({ top: 0, behavior: 'smooth'})}}>
      <div
        className={`nav-bar-button-container nav-bar-button-container-aligned ${handleNavItemActiveClass(path, "/")}`}
        onClick={() => {
          history.push('/')
        }}
      >
        <HomeIcon />
        <span className='nav-bar-button-text'>Home</span>
      </div>
      <div
        className={`nav-bar-button-container nav-bar-button-container-aligned ${handleNavItemActiveClass(path, "/users")}`}
        onClick={() => {history.push('/users')}}
      >
        <UserGroupIcon />
        <span className='nav-bar-button-text'>Users</span>
      </div>
      <div
        className={`nav-bar-button-container nav-bar-button-container-aligned ${handleNavItemActiveClass(path, "/profile")}`}
        onClick={() => {history.push('/profile')}}
      >
        <UserCircleIcon />
        <span className='nav-bar-button-text'>Profile</span>
      </div>
      {me &&
        <div
          className='nav-bar-button-container nav-bar-name-and-avatar'
          onClick={() => {history.push('/settings')}}
        >
          <span className='nav-bar-button-text'>{getNameAndSubName(me).name}</span>
          <div className='nav-bar-avatar'>
            <RoundAvatar user={me} disableNavigateToProfile={true}/>
          </div>
        </div>
      }
    </div>
  )
}
