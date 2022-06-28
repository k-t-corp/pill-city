import React from "react"
import {useHistory} from "react-router-dom";
import {useAppSelector} from "../../store/hooks";
import CirclesIcon from "../PillIcons/CirclesIcon";
import {BellIcon, HomeIcon, UserAddIcon, UserCircleIcon} from "@heroicons/react/solid";
import RoundAvatar from "../RoundAvatar/RoundAvatar";
import "./NavBar.css"

const handleNavItemActiveClass = (currentPage: number, expectedPage: number) => {
  return currentPage === expectedPage ? "nav-bar-button-active" : ''
}

interface Props {
  currentPage: number
  onChangePage: (page: number) => void
}

export default (props: Props) => {
  const {currentPage} = props

  const history = useHistory()

  const hasNewNotifications = useAppSelector(state => state.notifications.notifications.filter(n => n.unread).length > 0)
  const me = useAppSelector(state => state.me.me)

  return (
    <div className="nav-bar-container nav-bar-bottom">
      <div
        className={`nav-bar-button-container nav-bar-button-container-spaced ${handleNavItemActiveClass(currentPage, 0)}`}
        onClick={() => {
          props.onChangePage(0)
          history.push('/circles')
          window.scrollTo({ top: 0, behavior: 'smooth'})
        }}
      >
        <CirclesIcon />
      </div>
      <div
        className={`nav-bar-button-container nav-bar-button-container-spaced ${handleNavItemActiveClass(currentPage, 1)}`}
        onClick={() => {
          props.onChangePage(1)
          history.push('/users')
          window.scrollTo({ top: 0, behavior: 'smooth'})
        }}
      >
        <UserAddIcon />
      </div>
      <div
        className={`nav-bar-button-container nav-bar-button-container-spaced ${handleNavItemActiveClass(currentPage, 2)}`}
        onClick={() => {
          props.onChangePage(2)
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
        className={`nav-bar-button-container nav-bar-button-container-spaced ${handleNavItemActiveClass(currentPage, 3)}`}
        onClick={() => {
          props.onChangePage(3)
          history.push('/notifications')
          window.scrollTo({ top: 0, behavior: 'smooth'})
        }}
      >
        {hasNewNotifications && <div className='nav-bar-notification-indicator-wrapper'><div className='nav-bar-notification-indicator' /></div>}
        <BellIcon />
      </div>
      <div
        className={`nav-bar-button-container nav-bar-button-container-spaced ${handleNavItemActiveClass(currentPage, 4)}`}
        onClick={() => {
          props.onChangePage(4)
          history.push('/profile')
          window.scrollTo({ top: 0, behavior: 'smooth'})
        }}
      >
        <UserCircleIcon />
      </div>
    </div>
  )
}
