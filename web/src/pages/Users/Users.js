import React, {Component} from 'react'
import {Loader, Message} from "semantic-ui-react";
import CatchApiErrorBuilder from "../../api/CatchApiErrorBuilder";
import "./Users.css"

export default class Users extends Component {
  constructor(props) {
    super(props)
    this.state = {
      'loading': true,
      'error': undefined,
      'data': undefined
    }
  }

  showError = (err) => {
    this.setState({'error': err.toString()})
  }

  componentDidMount() {
    this.props.api.getUsers()
      .then(data => {
        this.setState({'data': data})
      })
      .catch(
        new CatchApiErrorBuilder()
          .unknownError(this.showError)
          .unknownStatusCode(this.showError)
          .build()
      ).finally(() => {
      this.setState({'loading': false})
    })
  }

  render() {
    if (this.state.loading) {
      return (
        <Loader size='massive'/>
      )
    }
    if (this.state.error) {
      return (
        <Message negative>{this.state.error}</Message>
      )
    }

    const users = this.state.data


    let userCardElements = []
    for (let i = 0; i < users.length; i++) {
      const userCardOnClick = () => {
        window.location.href = `/profile/${users[i].id}`
      }
      const createdAtDate = new Date(users[i]['created_at_seconds'] * 1000)
      userCardElements.push(
        <div className="users-user-card-wrapper" key={i} onClick={userCardOnClick}>
          <div className="users-user-card-avatar">
            <img className="users-user-card-avatar-img"  src={`${process.env.PUBLIC_URL}/kusuou.png`} alt=""/>
          </div>
            <div className="users-user-card-name">
              {users[i].id}
            </div>
          {/*Will cause overflow at this later*/}
          {/*<div className="users-user-card-join-time">*/}
          {/*  Joined on {createdAtDate.toLocaleDateString()}*/}
          {/*</div>*/}
        </div>
      )
    }

    return (
      <div className="users-grid-container">
        {userCardElements}
      </div>
    )
  }
}
