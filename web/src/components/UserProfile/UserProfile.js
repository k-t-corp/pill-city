import React, {useEffect, useState} from 'react'
import "./UserProfile.css"
import Post from "../Post/Post";
import getAvatarUrl from "../../api/getAvatarUrl";
import NewPost from "../NewPost/NewPost";

export default (props) => {
  const [postLoading, updatePostLoading] = useState(true)
  const [postData, updatePostData] = useState([])
  const [followingLoading, updateFollowingLoading] = useState(true)
  const [following, updateFollowing] = useState(false)
  const [newPostOpened, updateNewPostOpened] = useState(false)
  const [resharePostData, updateResharePostData] = useState(null)
  const [circles, updateCircles] = useState()
  const [me, updateMe] = useState()

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

  useEffect(async () => {
    if (!props.me) {
      const isFollowing = (await props.api.isFollowing(props.userData.id)).is_following
      updateFollowing(isFollowing)
    }
    updateFollowingLoading(false)
  }, [])

  const loadMorePosts = async () => {
    const lastPost = postData[postData.length - 1]
    const newPosts = await props.api.getProfile(props.userData.id, lastPost['id'])
    if (newPosts.length !== 0) {
      updatePostData(postData.concat(newPosts))
    } else {
      alert('Go back to real life')
    }
  }

  const profilePostElement = () => {
    if (postLoading) {
      return <div/>
    } else {
      let postElements = []
      for (let i = 0; i < postData.length; i++) {
        postElements.push(<Post key={i}
                                data={postData[i]}
                                api={props.api}
                                me={props.userData}
                                updateResharePostData={updateResharePostData}
                                hasNewPostModal={true}
                                newPostOpened={newPostOpened}
                                updateNewPostOpened={updateNewPostOpened}
        />)
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

  const unfollowOnClick = async () => {
    await props.api.unfollow(props.userData.id)
    window.location.reload()
  }

  const followOnClick = async () => {
    await props.api.follow(props.userData.id)
    window.location.reload()
  }

  const userInfoButton = () => {
    if (props.me) {
      return (
        <div className="user-profile-info-button" onClick={() => window.location.href = `/settings`}>
          Edit profile
        </div>
      )
    } else {
      if (followingLoading) {
        return null
      } else if (following) {
        return (
          <div className="user-profile-info-button" onClick={unfollowOnClick}>
            Unfollow
          </div>
        )
      } else {
        return (
          <div className="user-profile-info-button" onClick={followOnClick}>
            Follow
          </div>
        )
      }
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
          />
        </div>
      </div>
      }
    </div>
  )
}
