import React, {useEffect, useState} from 'react';
import Post from "../../components/Post/Post";
import "./Home.css"
import NewPost from "../../components/NewPost/NewPost";

require('promise.prototype.finally').shim();

export default (props) => {
  const userInfo = {
    user: {
      id: "ika",
      favicon: "kusuou.png",
    }
  }

  const [loading, updateLoading] = useState(true)

  const [posts, updatePosts] = useState([])
  const [circles, updateCircles] = useState([])

  useEffect(async ()=>{
    updatePosts(await props.api.getPosts())
    updateCircles(await props.api.getCircles())

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
          <NewPost userinfo={userInfo} circles={circles} api={props.api}/>
        </div>
      </div>
    )

}
