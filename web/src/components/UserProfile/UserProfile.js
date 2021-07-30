import React, {useEffect, useState} from 'react'
import "./UserProfile.css"
import Post from "../Post/Post";

export default (props) => {
  const [postLoading, updatePostLoading] = useState(true)
  const [postData, updatePostData] = useState([])
  useEffect(async () => {
    updatePostData(await props.api.getProfile(props.userData.id))
    updatePostLoading(false)
  }, [])
  const posts = () => {
    if (postLoading) {
      return <div/>
    } else {
      let postElements = []
      for (let i = 0; i < postData.length; i ++) {
        postElements.push(<Post key={i} data={postData[i]} api={props.api} />)
      }
      return postElements
    }
  }

  return (
    <div className="user-profile-wrapper">
      <div className="user-profile-user-info">
        <div className="user-profile-banner-wrapper">
          <img className="user-profile-banner-img" alt="user-banner"/>
        </div>
        <div className="user-profile-avatar-wrapper">
          <img className="user-profile-avatar-img" src={`${process.env.PUBLIC_URL}/kusuou.png`} alt="user-avatar"/>
        </div>
        <div className="user-profile-user-name">
          {props.userData.id}
        </div>
        {props.me ?
          // Save this part for later
          // <div className="user-profile-info-button">
          //   Edit profile
          // </div>
          null
          :
          <div className="user-profile-info-button">
            Follow
          </div>}
      </div>
      <div className="user-profile-posts">
        {posts()}
      </div>
    </div>
  )
}
