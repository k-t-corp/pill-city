import React, {Component} from 'react'
import {Redirect} from 'react-router-dom'
import {
  Menu,
  Icon,
  MenuItem
} from 'semantic-ui-react'
import {removeCookie} from "../../api/authCookie";
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
      removeCookie()
      this.setState({'redirectTo': '/signin'})
    }

    render() {
      if (this.state.redirectTo !== undefined && this.state.redirectTo !== path) {
        return <Redirect to={this.state.redirectTo}/>
      }

      return (
        <div>
          <Menu fixed='top'>
            <MenuItem
              as='a'
              onClick={() => {
                this.handleNavItemClick('/')
              }}
              active={path === '/'}
            >
              Home
            </MenuItem>
            <MenuItem
              as='a'
              onClick={() => {
                this.handleNavItemClick('/circles')
              }}
              active={path === '/circles'}
            >
              Circles
            </MenuItem>
            <MenuItem
              as='a'
              onClick={() => {
                this.handleNavItemClick('/circles')
              }}
              active={path === '/collections'}
            >
              Collections
            </MenuItem>
            <MenuItem
              as='a'
              onClick={() => {
                this.handleNavItemClick('/users')
              }}
              active={path === '/users'}
            >
              Users
            </MenuItem>
            <MenuItem
              as='a'
              onClick={() => {
                this.handleNavItemClick('/profile')
              }}
              active={path === '/profile'}
            >
              Profile
            </MenuItem>
            <Menu.Menu position='right'>
              <MenuItem as='a' size='large'>
                <Icon name='bell outline'/>
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
          <div className="container" >
            <WrappedComponent {...this.props}/>
          </div>
        </div>
      )
    }
  }
}
