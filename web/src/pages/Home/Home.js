import React, {useEffect, useState} from 'react';
import Post from "../../components/Post/Post";
import "./Home.css"
import NewPost from "../../components/NewPost/NewPost";

export default (props) => {
  const [loading, updateLoading] = useState(true)
  const [posts, updatePosts] = useState([])
  const [circles, updateCircles] = useState([])
  const [me, updateMe] = useState(null)
  const [resharePostData, updateResharePostData] = useState(null)

  useEffect(async ()=>{
    updatePosts(await props.api.getHome())
    updateCircles(await props.api.getCircles())
    updateMe(await props.api.getMe())

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
        postElements.push(<Post key={i} data={posts[i]} me={me} api={props.api} updateResharePostData={updateResharePostData}/>)
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
          <NewPost circles={circles}
                   me={me}
                   api={props.api}
                   resharePostData={resharePostData}
                   updateResharePostData={updateResharePostData}/>
        </div>
      </div>
    )

}
