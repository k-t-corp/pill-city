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
      const myFollowing = await props.api.getFollowings()
      for (let i = 0; i < myFollowing.length; i++) {
        if (myFollowing[i].id === props.userData.id) {
          updateFollowing(true)
          break
        }
      }
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
        <div className="user-profile-info-button">
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
        <div className="user-profile-banner-wrapper">
          <img className="user-profile-banner-img" alt="user-banner"/>
        </div>
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
