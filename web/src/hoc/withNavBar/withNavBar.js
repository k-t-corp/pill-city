import React, {Component} from 'react'
import {Redirect} from 'react-router-dom'
import {
  Menu,
  Icon,
  MenuItem
} from 'semantic-ui-react'
import {removeAccessToken} from "../../api/AuthStorage";
import "./withNavBar.css"

export default (WrappedComponent, path) => {
  return class extends Component {
    constructor(props) {
      super(props)
      this.state = {
        'redirectTo': undefined
      }
    }

    handleNavItemClick = (path) => {
      this.setState({'redirectTo': path})
    }

    handleSignOut = () => {
      removeAccessToken()
      this.setState({'redirectTo': '/signin'})
    }

    render() {
      if (this.state.redirectTo !== undefined && this.state.redirectTo !== path) {
        return <Redirect to={this.state.redirectTo}/>
      }

      return (
        <div>
          <Menu fixed='top' size="large" inverted>
            <MenuItem
              as='a'
              onClick={() => {
                this.handleNavItemClick('/')
              }}
              active={path === '/'}
            >
              <span role="img" aria-label="home">🏠</span>&nbsp;Home
            </MenuItem>
            <MenuItem
              as='a'
              onClick={() => {
                this.handleNavItemClick('/circles')
              }}
              active={path === '/circles'}
            >
              <span role="img" aria-label="circle">⭕</span>&nbsp;Circles
            </MenuItem>
            <MenuItem
              as='a'
              onClick={() => {
                this.handleNavItemClick('/circles')
              }}
              active={path === '/collections'}
            >
              <span role="img" aria-label="collection">📚</span>&nbsp;Collections
            </MenuItem>
            <MenuItem
              as='a'
              onClick={() => {
                this.handleNavItemClick('/users')
              }}
              active={path === '/users'}
            >
              <span role="img" aria-label="users">👩‍👩‍👦‍👦</span>&nbsp;Users
            </MenuItem>
            <MenuItem
              as='a'
              onClick={() => {
                this.handleNavItemClick('/profile')
              }}
              active={path === '/profile'}
            >
              <span role="img" aria-label="profile">🐒</span>&nbsp;Profile
            </MenuItem>
            <Menu.Menu position='right'>
              <MenuItem as='a' size='large'>
                &nbsp;&nbsp;&nbsp;<Icon name='bell outline'/>
              </MenuItem>
              <MenuItem
                as='a'
                onClick={() => {
                  this.handleSignOut()
                }}
              >
                Sign out
              </MenuItem>
            </Menu.Menu>
          </Menu>
          <div className="faq-semantic-container" >
            <WrappedComponent {...this.props}/>
          </div>
        </div>
      )
    }
  }
}
