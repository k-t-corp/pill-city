import React, {useEffect, useState} from 'react';
import Post from "../../components/Post/Post";
import "./Home.css"
import NewPost from "../../components/NewPost/NewPost";

export default (props) => {
  const [loading, updateLoading] = useState(true)
  const [posts, updatePosts] = useState([])
  const [circles, updateCircles] = useState([])
  const [me, updateMe] = useState(null)

  useEffect(async ()=>{
    updatePosts(await props.api.getPosts())
    updateCircles(await props.api.getCircles())
    updateMe(await props.api.getMe())

    updateLoading(false)
  }, [])

  let parseReactionData = (data) => {
    let parsedData = {} // Format: {emoji: [{author, reactionId}]}
    for (let i = 0; i < data.length; i++) {
      let emoji = data[i].emoji
      let author = data[i].author
      let reactionId = data[i].id
      if (emoji in parsedData) {
        parsedData[emoji].push({
          key: i,
          author: author,
          reactionId: reactionId
        })
      } else {
        parsedData[emoji] = [{
          key: i,
          author: author,
          reactionId: reactionId
        }]
      }
    }
    return parsedData
  }

  let homePostElement = () => {
    if (loading) {
      return (<div className="home-status">Loading...</div>)
    } else if (posts.length === 0) {
      return (<div className="home-status">No posts here</div>)
    } else {
      let postElements = []
      for (let i = 0; i < posts.length; i++) {
        posts[i].reactions = parseReactionData(posts[i].reactions)
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
          <NewPost circles={circles} me={me} api={props.api}/>
        </div>
      </div>
    )

}
