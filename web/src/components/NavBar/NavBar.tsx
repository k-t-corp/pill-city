import React from 'react'
import "./NavBar.css"
import {Menu, MenuItem} from "semantic-ui-react";
import {removeAccessToken} from "../../api/AuthStorage";
import {useMediaQuery} from "react-responsive";
import {useAppSelector} from "../../store/hooks";

interface Props {
  path: string,
  wrappedComponent: any
  updateRedirectTo: (newPath: string) => void
}

export default (props: Props) => {
  const hasNewNotifications = useAppSelector(state => state.notifications.notifications.filter(n => n.unread).length > 0)

  const isTabletOrMobile = useMediaQuery({query: '(max-width: 750px)'})

  const WebNavBarElem = () => {
    return (
      <div>
        <Menu fixed='top' size="large" inverted>
          <MenuItem
            as='a'
            onClick={() => {
              handleNavItemClick('/')
            }}
            active={props.path === '/'}
          >
            <span role="img" aria-label="home">🏠</span>Home
          </MenuItem>
          <MenuItem
            as='a'
            onClick={() => {
              handleNavItemClick('/circles')
            }}
            active={props.path === '/circles'}
          >
            <span role="img" aria-label="circle">⭕</span>Circles
          </MenuItem>
          {/*<MenuItem*/}
          {/*  as='a'*/}
          {/*  onClick={() => {*/}
          {/*    this.handleNavItemClick('/circles')*/}
          {/*  }}*/}
          {/*  active={props.path === '/collections'}*/}
          {/*>*/}
          {/*  <span role="img" aria-label="collection">📚</span>&nbsp;Collections*/}
          {/*</MenuItem>*/}
          <MenuItem
            as='a'
            onClick={() => {
              handleNavItemClick('/users')
            }}
            active={props.path === '/users'}
          >
            <span role="img" aria-label="users">👩‍👩‍👦‍👦</span>&nbsp;Users
          </MenuItem>
          <MenuItem
            as='a'
            onClick={() => {
              handleNavItemClick('/profile')
            }}
            active={props.path === '/profile'}
          >
            <span role="img" aria-label="profile">🐒</span>&nbsp;Profile
          </MenuItem>
          <Menu.Menu position='right'>
            {/* can use this later*/}
            {/*<MenuItem as='a'*/}
            {/*          size='large'*/}
            {/*          // onClick={() => this.state.openNotificationDropdown = ! this.state.openNotificationDropdown}*/}
            {/*>*/}
            {/*  &nbsp;&nbsp;&nbsp;<Icon name='bell outline'/>*/}
            {/*</MenuItem>*/}
            <MenuItem
              as='a'
              onClick={() => {
                handleSignOut()
              }}
            >
              Sign out
            </MenuItem>
          </Menu.Menu>
        </Menu>
        <div className="faq-semantic-container">
          {props.wrappedComponent}
        </div>
      </div>)
  }

  const MobileNavBarElem = () => {
    return (
      <div className="mobile-nav-bar-wrapper">
        <div className="mobile-nav-bar-container">
          <div className={`mobile-nav-bar-button-container ${handleNavItemActiveClass("/users")}`} onClick={() => {
            handleNavItemClick('/users')
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
            </svg>
          </div>
          <div className={`mobile-nav-bar-button-container ${handleNavItemActiveClass("/circles")}`} onClick={() => {
            handleNavItemClick('/circles')
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"/>
            </svg>
          </div>
          <div className={`mobile-nav-bar-button-container ${handleNavItemActiveClass("/")}`} onClick={() => {
            handleNavItemClick('/')
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
          </div>
          <div className={`mobile-nav-bar-button-container ${handleNavItemActiveClass("/notifications")}`}
               onClick={() => {
                 handleNavItemClick('/notifications')
               }}>

            {hasNewNotifications && <div className='mobile-nav-bar-notification-indicator-wrapper'><div className='mobile-nav-bar-notification-indicator' /></div>}

            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
          </div>
          <div className={`mobile-nav-bar-button-container ${handleNavItemActiveClass("/profile")}`} onClick={() => {
            handleNavItemClick('/profile')
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"/>
            </svg>
          </div>
        </div>
        <div className="faq-semantic-container">
          {props.wrappedComponent}
        </div>
      </div>)
  }

  const handleNavItemClick = (path: string) => {
    props.updateRedirectTo(path)
  }

  const handleNavItemActiveClass = (path: string) => {
    return props.path === path ? "mobile-nav-bar-button-active" : null
  }

  const handleSignOut = () => {
    removeAccessToken()
    // This is needed so that the App component is fully reloaded
    // so that getting the first home page and auto refresh is disabled
    window.location.href = '/signin'
  }

  return (
    isTabletOrMobile ? <MobileNavBarElem/> : <WebNavBarElem/>
  )
}
