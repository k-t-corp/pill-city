import React, {Component} from 'react'
import {Message, Loader} from 'semantic-ui-react'
import UserProfile from "../../components/UserProfile/UserProfile";


export default class Profile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      'loading': true,
      'error': undefined,
      'data': undefined,
    }
  }

  componentDidMount() {
    let promise
    if (!this.props.userId) {
      promise = this.props.api.getMe()
    } else {
      promise = this.props.api.getUser(this.props.userId)
    }
    promise
      .then(data => {
        this.setState({ data })
      })
      .catch(error => {
        this.setState({ error })
      }
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
    return (<UserProfile userData={this.state.data} me={!this.props.userId} api={this.props.api}/>)
  }
}
