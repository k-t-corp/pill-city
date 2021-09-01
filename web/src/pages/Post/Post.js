import React, {Component} from 'react'
import {Loader} from 'semantic-ui-react'
import PostComponent from "../../components/Post/Post";
import './Post.css'

export default class Post extends Component {
  constructor(props) {
    super(props)
    this.state = {
      'loading': true,
      'error': undefined,
      'data': undefined,
      'me': undefined
    }
  }

  componentDidMount() {
    Promise.all(
      [
        this.props.api.getPost(this.props.postId),
        this.props.api.getMe()
      ]
    )
      .then(([data, me]) => {
        this.setState({ data, me })
      })
      .catch(error => {
        this.setState({ error })
      })
      .finally(() => {
        this.setState({'loading': false})
      })
  }

  render() {
    let highlightCommentId
    if (this.props.location.hash) {
      highlightCommentId = this.props.location.hash.split('#comment-')[1]
    }
    console.log(highlightCommentId)
    if (this.state.loading) {
      return (
        <Loader size='massive'/>
      )
    }
    if (this.state.error) {
      return (
        <div>{this.state.error.toString()}</div>
      )
    }
    return (
      <div className='post-wrapper-page'>
        <PostComponent data={this.state.data} highlightCommentId={highlightCommentId} me={this.state.me} api={this.props.api}/>
      </div>
    )
  }
}
