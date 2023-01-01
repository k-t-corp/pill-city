import React from 'react'
import {useMediaQuery} from "react-responsive";
import {useAppSelector} from "../../store/hooks";
import {useHistory, useLocation} from "react-router-dom";
import "./NavBar.css"
import {BellIcon, HomeIcon, UserAddIcon, UserCircleIcon, UserGroupIcon} from "@heroicons/react/solid";
import CirclesIcon from "../PillIcons/CirclesIcon";
import getNameAndSubName from "../../utils/getNameAndSubName";
import RoundAvatar from "../RoundAvatar/RoundAvatar";

const handleNavItemActiveClass = (currentPath: string, expectedPath: string) => {
  return currentPath === expectedPath ? "nav-bar-button-active" : ''
}

const DesktopNavBar = () => {
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

const MobileNavBar = () => {
  const history = useHistory()
  const path =  useLocation().pathname

  const hasNewNotifications = useAppSelector(state => state.notifications.notifications.filter(n => n.unread).length > 0)
  const me = useAppSelector(state => state.me.me)


  return (
    <div className="nav-bar-container nav-bar-bottom">
      <div
        className={`nav-bar-button-container nav-bar-button-container-spaced ${handleNavItemActiveClass(path, "/circles")}`}
        onClick={() => {
          history.push('/circles')
          window.scrollTo({ top: 0, behavior: 'smooth'})
        }}
      >
        <CirclesIcon />
      </div>
      <div
        className={`nav-bar-button-container nav-bar-button-container-spaced ${handleNavItemActiveClass(path, "/users")}`}
        onClick={() => {
          history.push('/users')
          window.scrollTo({ top: 0, behavior: 'smooth'})
        }}
      >
        <UserAddIcon />
      </div>
      <div
        className={`nav-bar-button-container nav-bar-button-container-spaced ${handleNavItemActiveClass(path, "/")}`}
        onClick={() => {
          history.push('/')
          window.scrollTo({ top: 0, behavior: 'smooth'})
        }}
      >
        {
          me && me.avatar_url_v2?
            <div className='mobile-nav-bar-avatar'>
              <RoundAvatar user={me} disableNavigateToProfile={true}/>
            </div> :
            <HomeIcon />
        }
      </div>
      <div
        className={`nav-bar-button-container nav-bar-button-container-spaced ${handleNavItemActiveClass(path, "/notifications")}`}
        onClick={() => {
          history.push('/notifications')
          window.scrollTo({ top: 0, behavior: 'smooth'})
        }}
      >
        {hasNewNotifications && <div className='nav-bar-notification-indicator-wrapper'><div className='nav-bar-notification-indicator' /></div>}
        <BellIcon />
      </div>
      <div
        className={`nav-bar-button-container nav-bar-button-container-spaced ${handleNavItemActiveClass(path, "/profile")}`}
        onClick={() => {
          history.push('/profile')
          window.scrollTo({ top: 0, behavior: 'smooth'})
        }}
      >
        <UserCircleIcon />
      </div>
    </div>
  )
}

const NavBar = () => {
  const isMobile = useMediaQuery({query: '(max-width: 750px)'})

  return (
    isMobile ? <MobileNavBar /> : <DesktopNavBar />
  )
}

export default NavBar
