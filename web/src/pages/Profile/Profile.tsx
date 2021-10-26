import React, {useEffect, useState} from 'react'
import {useHistory} from "react-router-dom";
import PostComponent from "../../components/Post/Post";
import NewPost from "../../components/NewPost/NewPost";
import getProfilePicUrl from "../../api/getProfilePicUrl";
import getAvatarUrl from "../../api/getAvatarUrl";
import ApiError from "../../api/ApiError";
import "./Profile.css"
import User from "../../models/User";
import PostModel from "../../models/Post"
import useInView from "react-cool-inview";

const InfiniteScrollFactor = 0.8

interface Props {
  api: any
  userId?: string
}

export default (props: Props) => {
  const [user, updateUser] = useState<User | null>(null)
  const [me, updateMe] = useState<User | null>(null)
  const [userNotFound, updateUserNotFound] = useState(false)

  const [postsLoading, updatePostsLoading] = useState(true)
  const [posts, updatePosts] = useState<PostModel[]>([])
  const [loadingMorePosts, updateLoadingMorePosts] = useState(false)
  const [noMoreNewPosts, updateNoMoreNewPosts] = useState(false)

  const [newPostOpened, updateNewPostOpened] = useState(false)
  const [resharePost, updateResharePost] = useState<PostModel | null>(null)

  const [isFollowing, updateIsFollowing] = useState(false)
  const [followLoading, updateFollowLoading] = useState(true)

  const history = useHistory()

  window.onclick = function(event) {
    let modal = document.getElementById("profile-new-post-modal");
    if (event.target === modal) {
      updateNewPostOpened(false)
    }
  }

  useEffect(() => {
    (async () => {
      const me = await props.api.getMe()
      updateMe(me)
      if (!props.userId) {
        updateUser(me)
        updatePosts(await props.api.getProfile(me.id))
        updatePostsLoading(false)
        updateFollowLoading(false)
      } else {
        let user
        try {
          user = await props.api.getUser(props.userId)
          updateUser(user)
          updateIsFollowing(user.is_following)
          updatePosts(await props.api.getProfile(props.userId))
          updatePostsLoading(false)
          updateFollowLoading(false)
        } catch (e) {
          if (e instanceof ApiError && e.statusCode === 404) {
            updateUserNotFound(true)
          } else {
            throw e
          }
        }
      }
    })()
  }, [])

  const loadMorePosts = async () => {
    if (loadingMorePosts || user === null) {
      return
    }
    updateLoadingMorePosts(true)
    const lastPost = posts[posts.length - 1]
    const newPosts = await props.api.getProfile(user.id, lastPost['id'])
    if (newPosts.length !== 0) {
      updatePosts(posts.concat(newPosts))
    } else {
      updateNoMoreNewPosts(true)
    }
    updateLoadingMorePosts(false)
  }

  const { observe } = useInView({
    rootMargin: "50px 0px",
    onEnter: async ({ unobserve, observe }) => {
      unobserve()
      await loadMorePosts()
      observe()
    }
  })

  const profilePosts = () => {
    if (userNotFound) {
      return (<div className="profile-status">User not found</div>)
    } else if (postsLoading) {
      return (<div className="profile-status">Loading...</div>)
    } else if (posts.length === 0) {
      return (<div className="profile-status">No posts here</div>)
    } else {
      let postElements = []
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i]
        postElements.push(
          <div
            // need to use post ID instead of index as key
            // otherwise comments and reactions will be shifted after a new post is prepended
            key={post.id}
            ref={i === Math.floor(posts.length * InfiniteScrollFactor) - 1 ? observe : null}
          >
            <PostComponent
              data={post}
              api={props.api}
              me={me}
              updateResharePostData={updateResharePost}
              hasNewPostModal={true}
              newPostOpened={newPostOpened}
              updateNewPostOpened={updateNewPostOpened}
            />
          </div>
        )
      }
      let endElem
      if (noMoreNewPosts) {
        endElem = (
          <div
            key={posts.length}
            className='profile-load-more profile-load-more-disable'
          >No more new posts</div>
        )
      } else if (loadingMorePosts) {
        endElem = (
          <div
            key={posts.length}
            className='profile-load-more'
            onClick={loadMorePosts}
          >Load more</div>
        )
      } else {
        endElem = (
          <div
            key={posts.length}
            className='profile-load-more profile-load-more-disable'
          >Loading...</div>
        )
      }
      postElements.push(endElem)
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
        <div
          className="profile-info-button"
          onClick={() => {
            history.push(`/settings`)
          }}
        >
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

  let profileDisplayName
  if (props.userId) {
    if (user !== null) {
      if (user.display_name) {
        profileDisplayName = user.display_name
      } else {
        profileDisplayName = user.id
      }
    } else {
      profileDisplayName = '...'
    }
  } else {
    if (me !== null) {
      if (me.display_name) {
        profileDisplayName = me.display_name
      } else {
        profileDisplayName = me.id
      }
    } else {
      profileDisplayName = '...'
    }
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-user-info">
        <div className="profile-banner-wrapper" style={{
          backgroundColor: "#9dd0ff",
          backgroundImage: user ? `url(${getProfilePicUrl(user)})` : undefined
        }}/>
        <div className="profile-avatar-wrapper">
          {/* Not using RoundAvatar here because it doesn't need to be clicked + it has extra styles*/}
          <img
            className="profile-avatar-img"
            src={getAvatarUrl(user)}
            alt=""
          />
        </div>
        <div className="profile-user-name">
          {profileDisplayName}
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
            resharePostData={resharePost}
            updateResharePostData={updateResharePost}
            beforePosting={() => {
              updateNewPostOpened(false)
            }}
            afterPosting={(post) => {
              if (!props.userId) {
                updatePosts([post, ...posts])
              }
            }}
          />
        </div>
      </div>
      }
    </div>
  )
}
