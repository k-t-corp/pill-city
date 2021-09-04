import React, {useEffect, useState} from 'react'
import "./UserProfile.css"
import Post from "../Post/Post";
import getAvatarUrl from "../../api/getAvatarUrl";

export default (props) => {
  const [postLoading, updatePostLoading] = useState(true)
  const [postData, updatePostData] = useState([])
  const [followingLoading, updateFollowingLoading] = useState(true)
  const [following, updateFollowing] = useState(false)

  useEffect(async () => {
    updatePostData(await props.api.getProfile(props.userData.id))
    updatePostLoading(false)
  }, [])
  useEffect(async () => {
    if (!props.me) {
      const isFollowing = (await props.api.isFollowing(props.userData.id)).is_following
      updateFollowing(isFollowing)
    }
    updateFollowingLoading(false)
  }, [])
  const posts = () => {
    if (postLoading) {
      return <div/>
    } else {
      let postElements = []
      for (let i = 0; i < postData.length; i++) {
        postElements.push(<Post key={i} data={postData[i]} api={props.api} me={props.userData}/>)
      }
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
        <div className="user-profile-banner-wrapper"/>
        <div className="user-profile-avatar-wrapper">
          <img className="user-profile-avatar-img" src={getAvatarUrl(props.userData)} alt="user-avatar"/>
        </div>
        <div className="user-profile-user-name">
          {props.userData.id}
        </div>
        {userInfoButton()}
      </div>
      <div className="user-profile-posts">
        {posts()}
      </div>
    </div>
  )
}
