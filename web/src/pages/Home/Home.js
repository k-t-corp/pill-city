import React, {useEffect, useState} from 'react';
import Post from "../../components/Post/Post";
import "./Home.css"
import NewPost from "../../components/NewPost/NewPost";

require('promise.prototype.finally').shim();

export default (props) => {
  const newPostData = {
    user: {
      id: "ika",
      favicon: "kusuou.PNG",
    }
  }
  const [loading, updateLoading] = useState(true)
  const [posts, updatePosts] = useState([])
  useEffect(async ()=>{
    const postData = await props.api.getPosts()
    updatePosts(postData)
    updateLoading(false)
  }, [])

  let homePostElement = () => {
    if (loading) {
      return (<div className="home-status">Loading...</div>)
    } else if (posts.length === 0) {
      return (<div className="home-status">No posts here</div>)
    } else {
      let postElements = []
      for (let i = 0; i < posts.length; i++) {
        postElements.push(<Post key={i} data={posts[i]} api={props.api}/>)
      }
      return postElements
    }
  }

    return (
      <div className="home-wrapper">
        <div className="home-posts-wrapper">
          {homePostElement()}
        </div>
        <div className="home-new-post-wrapper">
          <NewPost userinfo={newPostData} api={props.api}/>
        </div>
      </div>
    )

}
