import React, {useEffect, useState} from 'react'
import "./UserProfile.css"
import Post from "../Post/Post";
import getAvatarUrl from "../../api/getAvatarUrl";
import NewPost from "../NewPost/NewPost";

export default (props) => {
  const [postLoading, updatePostLoading] = useState(true)
  const [postData, updatePostData] = useState([])
  const [newPostOpened, updateNewPostOpened] = useState(false)
  const [resharePostData, updateResharePostData] = useState(null)
  const [circles, updateCircles] = useState()
  const [me, updateMe] = useState()
  const [followLoading, updateFollowLoading] = useState(false)
  // TODO: this might be buggy?
  const [isFollowing, updateIsFollowing] = useState(props.userData.is_following)
  const [postingNewPost, updatePostingNewPost] = useState(false)

  window.onclick = function(event) {
    let modal = document.getElementById("profile-new-post-modal");
    if (event.target === modal) {
      updateNewPostOpened(false)
    }
  }

  useEffect(async () => {
    updatePostData(await props.api.getProfile(props.userData.id))
    updateCircles(await props.api.getCircles())
    updateMe(await props.api.getMe())
    updatePostLoading(false)
  }, [])

  const loadMorePosts = async () => {
    const lastPost = postData[postData.length - 1]
    const newPosts = await props.api.getProfile(props.userData.id, lastPost['id'])
    if (newPosts.length !== 0) {
      updatePostData(postData.concat(newPosts))
    } else {
      alert('You have reached the end.')
    }
  }

  const profilePostElement = () => {
    if (postLoading) {
      return (<div className="user-profile-status">Loading...</div>)
    } else if (postData.length === 0) {
      return (<div className="user-profile-status">No posts here</div>)
    } else {
      let postElements = []
      if (postingNewPost) {
        postElements.push(
          <div key='posting' className="user-profile-status">Sending new post...</div>
        )
      }
      for (let i = 0; i < postData.length; i++) {
        const post = postData[i]
        postElements.push(
          <Post
            // need to use post ID instead of index as key
            // otherwise comments and reactions will be shifted after a new post is prepended
            key={post.id}
            data={post}
            api={props.api}
            me={props.userData}
            updateResharePostData={updateResharePostData}
            hasNewPostModal={true}
            newPostOpened={newPostOpened}
            updateNewPostOpened={updateNewPostOpened}
          />
        )
      }
      postElements.push(
        <div
          key={postData.length}
          className='profile-load-more'
          onClick={loadMorePosts}
        >Load more</div>
      )
      return postElements
    }
  }

  const followOnClick = async () => {
    if (followLoading) {
      return
    }
    updateFollowLoading(true)
    if (isFollowing) {
      await props.api.unfollow(props.userData.id)
    } else {
      await props.api.follow(props.userData.id)
    }
    updateIsFollowing(!isFollowing)
    updateFollowLoading(false)
  }

  const userInfoButton = () => {
    if (props.me) {
      return (
        <div className="user-profile-info-button" onClick={() => window.location.href = `/settings`}>
          Edit profile
        </div>
      )
    } else {
      return (
        <div
          className={!followLoading ? "user-profile-info-button" : "user-profile-info-button user-profile-info-button-disabled"}
          onClick={followOnClick}
        >{isFollowing ? 'Unfollow' : 'Follow'}</div>
      )
    }
  }

  return (
    <div className="user-profile-wrapper">
      <div className="user-profile-user-info">
        <div className="user-profile-banner-wrapper" style={{
          backgroundColor: "#9dd0ff",
          backgroundImage: `url(${process.env.PUBLIC_URL}/${props.userData.profile_pic})`
        }}/>
        <div className="user-profile-avatar-wrapper">
          <img className="user-profile-avatar-img" src={getAvatarUrl(props.userData)} alt="user-avatar"/>
        </div>
        <div className="user-profile-user-name">
          {props.userData.id}
        </div>
        {userInfoButton()}
      </div>
      <div className="user-profile-posts">
        {profilePostElement()}
      </div>
      {newPostOpened &&
        <div id="profile-new-post-modal" className="post-detail-new-post-modal">
          <div className="post-detail-new-post-modal-content">
            <NewPost
              circles={circles}
              me={me}
              api={props.api}
              resharePostData={resharePostData}
              updateResharePostData={updateResharePostData}
              beforePosting={() => {
                updateNewPostOpened(false)
                if (!props.me) {
                  // not showing my own profile, no need to show "sending post" to stream
                  // TODO: maybe a toast?
                  return
                }
                updatePostingNewPost(true)
              }}
              afterPosting={(post) => {
                if (!props.me) {
                  // not showing my own profile, no need to prepend new post to stream
                  // TODO: maybe a toast?
                  return
                }
                updatePostingNewPost(false)
                updatePostData([post, ...postData])
              }}
            />
          </div>
        </div>
      }
    </div>
  )
}
