import React from "react"
import {useHistory, useLocation} from "react-router-dom";
import {useAppSelector} from "../../store/hooks";
import CirclesIcon from "../PillIcons/CirclesIcon";
import {BellIcon, HomeIcon, UserAddIcon, UserCircleIcon} from "@heroicons/react/solid";
import RoundAvatar from "../RoundAvatar/RoundAvatar";
import "./NavBar.css"

const handleNavItemActiveClass = (currentPath: string, expectedPath: string) => {
  return currentPath === expectedPath ? "nav-bar-button-active" : ''
}

export default () => {
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
