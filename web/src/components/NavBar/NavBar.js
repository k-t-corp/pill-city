import React, {Component} from 'react'
import "./NavBar.css"
import {Menu, MenuItem} from "semantic-ui-react";
import {removeAccessToken} from "../../api/AuthStorage";

export default (props) => {
  const handleNavItemClick = (path) => {
    props.updateRedirectTo(path)
  }

  const handleSignOut = () => {
    removeAccessToken()
    props.updateRedirectTo('/signin')
  }
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
          <span role="img" aria-label="home">🏠</span>&nbsp;Home
        </MenuItem>
        <MenuItem
          as='a'
          onClick={() => {
            handleNavItemClick('/circles')
          }}
          active={props.path === '/circles'}
        >
          <span role="img" aria-label="circle">⭕</span>&nbsp;Circles
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
    </div>
  )
}
