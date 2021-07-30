import React, {Component} from 'react'
import CatchApiErrorBuilder from '../../api/CatchApiErrorBuilder'
import {Message, Loader} from 'semantic-ui-react'
import UserProfile from "../../components/UserProfile/UserProfile";

require('promise.prototype.finally').shim();


export default class Profile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      'loading': true,
      'error': undefined,
      'data': undefined,
      'isMe': false
    }
  }

  showError = (err) => {
    this.setState({'error': err.toString()})
  }

  componentDidMount() {
    this.props.api.getMe()
      .then(data => {
        if (this.props.userId === undefined || data.id === this.props.userId) {
          this.setState({'isMe': true})
          this.setState({'data': data})
        } else {
          this.setState({'data': {"id": this.props.userId}})
        }
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

    return (<UserProfile me={this.state.isMe} userData={this.state.data} api={this.props.api}/>)
  }
}
