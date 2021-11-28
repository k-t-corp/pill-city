import React, {useEffect, useState} from 'react'
import {useLocation, useParams} from "react-router-dom";
import PostComponent from "../../components/Post/Post";
import NewPost from "../../components/NewPost/NewPost";
import withApi from "../../hoc/withApi";
import withAuthRedirect from "../../hoc/withAuthRedirect";
import withNavBar from "../../hoc/withNavBar/withNavBar";
import api from "../../api/Api";
import './Post.css'
import {useAppSelector} from "../../store/hooks";

const Post = (props) => {
  const { id: postId } = useParams()
  const me = useAppSelector(state => state.me.me)

  const [loading, updateLoading] = useState(true)
  const [post, updatePost] = useState(null)
  const [resharePost, updateResharePost] = useState(null)
  const [newPostOpened, updateNewPostOpened] = useState(false)

  useEffect(async () => {
    updatePost(await props.api.getPost(postId))
    updateLoading(false)
  }, [])

  let highlightCommentId
  const location = useLocation()
  if (location.hash) {
    highlightCommentId = location.hash.split('#comment-')[1]
  }

  const renderPost = () => {
    if (loading) {
      return (<div className="post-status">Loading...</div>)
    }
    if (!post) {
      return (<div className="post-status">Errored loading post</div>)
    }
    return (
      <>
        <PostComponent
          detail={true}
          hasNewPostModal={true}
          data={post}
          highlightCommentId={highlightCommentId}
          me={me}
          api={props.api}
          disableNavigateToPostPage={true}
          resharePostData={resharePost}
          updateResharePostData={updateResharePostData}
          updateNewPostOpened={updateMobileNewPostOpened}
        />
        {newPostOpened &&
          <div id="post-new-post-modal" className="post-detail-new-post-modal">
            <div className="post-detail-new-post-modal-content">
              <NewPost
                api={props.api}
                resharePostData={resharePost}
                updateResharePostData={updateResharePostData}
                beforePosting={() => {
                  updateMobileNewPostOpened(false)
                }}
                afterPosting={() => {}}
              />
            </div>
          </div>
        }
      </>
    )
  }

  window.onclick = (event) => {
    let modal = document.getElementById("post-new-post-modal");
    if (event.target === modal) {
      updateNewPostOpened(false)
    }
  }

  const updateResharePostData = (data) => {
    updateResharePost(data)
  }
  const updateMobileNewPostOpened = (opened) => {
    updateNewPostOpened(opened)
  }

  return (
    <div className='post-wrapper-page'>
      {renderPost()}
    </div>
  )
}

export default withApi(withAuthRedirect(withNavBar(Post, '/post')), api)
