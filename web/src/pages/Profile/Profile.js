import React, {useEffect, useState} from 'react'
import PostComponent from "../../components/Post/Post";
import NewPost from "../../components/NewPost/NewPost";
import {useToast} from "../../components/Toast/ToastProvider";
import getProfilePicUrl from "../../api/getProfilePicUrl";
import getAvatarUrl from "../../api/getAvatarUrl";
import "./Profile.css"

export default (props) => {
  const [user, updateUser] = useState(null)
  const [me, updateMe] = useState(null)

  const [postsLoading, updatePostsLoading] = useState(true)
  const [posts, updatePosts] = useState([])
  const [loadingMorePosts, updateLoadingMorePosts] = useState(false)

  const [newPostOpened, updateNewPostOpened] = useState(false)
  const [resharePostData, updateResharePostData] = useState(null)

  const [isFollowing, updateIsFollowing] = useState(false)
  const [followLoading, updateFollowLoading] = useState(true)

  const {addToast} = useToast()

  window.onclick = function(event) {
    let modal = document.getElementById("profile-new-post-modal");
    if (event.target === modal) {
      updateNewPostOpened(false)
    }
  }

  useEffect(async () => {
    const me = await props.api.getMe()
    updateMe(me)
    if (!props.userId) {
      updateUser(me)
      updatePosts(await props.api.getProfile(me.id))
    } else {
      const user = await props.api.getUser(props.userId)
      updateUser(user)
      updateIsFollowing(user.is_following)
      updatePosts(await props.api.getProfile(props.userId))
    }
    updatePostsLoading(false)
    updateFollowLoading(false)
  }, [])

  const loadMorePosts = async () => {
    if (loadingMorePosts) {
      return
    }
    updateLoadingMorePosts(true)
    const lastPost = posts[posts.length - 1]
    const newPosts = await props.api.getProfile(user.id, lastPost['id'])
    if (newPosts.length !== 0) {
      updatePosts(posts.concat(newPosts))
    } else {
      alert('You have reached the end.')
    }
    updateLoadingMorePosts(false)
  }

  const profilePosts = () => {
    if (postsLoading) {
      return (<div className="profile-status">Loading...</div>)
    } else if (posts.length === 0) {
      return (<div className="profile-status">No posts here</div>)
    } else {
      let postElements = []
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i]
        postElements.push(
          <PostComponent
            // need to use post ID instead of index as key
            // otherwise comments and reactions will be shifted after a new post is prepended
            key={post.id}
            data={post}
            api={props.api}
            me={me}
            updateResharePostData={updateResharePostData}
            hasNewPostModal={true}
            newPostOpened={newPostOpened}
            updateNewPostOpened={updateNewPostOpened}
          />
        )
      }
      if (!loadingMorePosts) {
        postElements.push(
          <div
            key={posts.length}
            className='profile-load-more'
            onClick={loadMorePosts}
          >Load more</div>
        )
      } else {
        postElements.push(
          <div
            key={posts.length}
            className='profile-load-more profile-load-more-disable'
          >Loading...</div>
        )
      }
      return postElements
    }
  }

  const followOnClick = async () => {
    if (followLoading) {
      return
    }
    updateFollowLoading(true)
    if (isFollowing) {
      await props.api.unfollow(props.userId)
    } else {
      await props.api.follow(props.userId)
    }
    updateIsFollowing(!isFollowing)
    updateFollowLoading(false)
  }

  const userInfoButton = () => {
    if (!props.userId) {
      return (
        <div className="profile-info-button" onClick={() => window.location.href = `/settings`}>
          Edit profile
        </div>
      )
    } else {
      return (
        <div
          className={!followLoading ? "profile-info-button" : "profile-info-button profile-info-button-disabled"}
          onClick={followOnClick}
        >{isFollowing ? 'Unfollow' : 'Follow'}</div>
      )
    }
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-user-info">
        <div className="profile-banner-wrapper" style={{
          backgroundColor: "#9dd0ff",
          backgroundImage: `url(${getProfilePicUrl(user)})`
        }}/>
        <div className="profile-avatar-wrapper">
          <img className="profile-avatar-img" src={getAvatarUrl(user)} alt="user-avatar"/>
        </div>
        <div className="profile-user-name">
          {user !== null ? user.id : ''}
        </div>
        {userInfoButton()}
      </div>
      <div className="profile-posts">
        {profilePosts()}
      </div>
      {newPostOpened &&
      <div id="profile-new-post-modal" className="post-detail-new-post-modal">
        <div className="post-detail-new-post-modal-content">
          <NewPost
            api={props.api}
            resharePostData={resharePostData}
            updateResharePostData={updateResharePostData}
            beforePosting={() => {
              updateNewPostOpened(false)
              addToast('Sending new post')
            }}
            afterPosting={(post) => {
              if (!props.userId) {
                updatePosts([post, ...posts])
              }
              addToast('New post sent')
            }}
          />
        </div>
      </div>
      }
    </div>
  )
}
