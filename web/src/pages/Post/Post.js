import React, {Component} from 'react'
import {Loader} from 'semantic-ui-react'
import PostComponent from "../../components/Post/Post";
import './Post.css'
import NewPost from "../../components/NewPost/NewPost";

export default class Post extends Component {
  constructor(props) {
    super(props)
    this.state = {
      'loading': true,
      'error': undefined,
      'data': undefined,
      'me': undefined,
      'resharePostData': null,
      'newPostOpened': false,
      'circles': undefined
    }
  }

  componentDidMount() {
    Promise.all(
      [
        this.props.api.getPost(this.props.postId),
        this.props.api.getMe(),
        this.props.api.getCircles()
      ]
    )
      .then(([data, me, circles]) => {
        this.setState({data, me, circles})
      })
      .catch(error => {
        this.setState({error})
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

    const thisThis = this
    window.onclick = function(event) {
      let modal = document.getElementById("post-new-post-modal");
      if (event.target === modal) {
        thisThis.setState({'newPostOpened': false})
      }
    }

    const updateResharePostData = (data) => this.setState({'resharePostData': data})
    const updateMobileNewPostOpened = (opened) => {
      this.setState({'newPostOpened': opened})
    }
    return (
      <div className='post-wrapper-page'>
        <PostComponent
          detail={true}
          hasNewPostModal={true}
          data={this.state.data}
          highlightCommentId={highlightCommentId}
          me={this.state.me}
          api={this.props.api}
          disableNavigateToPostPage={true}
          resharePostData={this.resharePostData}
          updateResharePostData={updateResharePostData}
          updateNewPostOpened={updateMobileNewPostOpened}
        />
        {this.state.newPostOpened &&
          <div id="post-new-post-modal" className="post-detail-new-post-modal">
            <div className="post-detail-new-post-modal-content">
              <NewPost
                circles={this.state.circles}
                me={this.state.me}
                api={this.props.api}
                resharePostData={this.state.resharePostData}
                updateResharePostData={this.updateResharePostData}
                beforePosting={() => {
                  // TODO: maybe a toast?
                  updateMobileNewPostOpened(false)
                }}
                afterPosting={() => {
                  // TODO: maybe a toast?
                }}
              />
            </div>
          </div>
        }
      </div>
    )
  }
}
