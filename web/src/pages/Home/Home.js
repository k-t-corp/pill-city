import React, {useEffect, useState} from 'react';
import { useInterval } from 'react-interval-hook';
import Post from "../../components/Post/Post";
import "./Home.css"
import NewPost from "../../components/NewPost/NewPost";
import NotificationDropdown from "../../components/NotificationDropdown/NotificationDropdown";

export default (props) => {
  const [loading, updateLoading] = useState(true)
  const [posts, updatePosts] = useState([])
  const [circles, updateCircles] = useState([])
  const [me, updateMe] = useState(null)
  const [resharePostData, updateResharePostData] = useState(null)
  const [notifications, updateNotifications] = useState(null)

  useEffect(async () => {
    updateMe(await props.api.getMe())
    updatePosts(await props.api.getHome())
    updateNotifications(await props.api.getNotifications())
    updateCircles(await props.api.getCircles())
    updateLoading(false)
  }, [])

  useInterval(async () => {
    const lastNotification = notifications[0]
    const fetchedNewNotifications = await props.api.getNotifications()
    // find position of lastNotification in fetchedNewNotifications
    // anything that comes "before" lastNotification are actual new notifications
    // TODO: there is a subtle bug that
    // TODO: if there are more than page size number of actual new notifications
    // TODO: some of them won't be displayed until load more or manual refresh page
    const newNotifications = []
    for (const n of fetchedNewNotifications) {
      if (n.id !== lastNotification.id) {
        newNotifications.push(n)
      } else {
        break
      }
    }
    updateNotifications([...newNotifications, ...notifications])
  }, 5000)

  const loadMorePosts = async () => {
    const lastPost = posts[posts.length - 1]
    const newPosts = await props.api.getHome(
      lastPost['created_at_ms'],
      lastPost['id']
    )
    if (newPosts.length !== 0) {
      updatePosts(posts.concat(newPosts))
    } else {
      alert('Go back to real life')
    }
  }

  const loadMoreNotifications = async () => {
    const lastNotification = notifications[notifications.length - 1]
    const newNotifications = await props.api.getNotifications(
      lastNotification['created_at_ms'],
      lastNotification['id']
    )
    if (newNotifications.length !== 0) {
      updateNotifications(notifications.concat(newNotifications))
    }
  }

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
      postElements.push(
        <div
          key={posts.length}
          className='home-load-more'
          onClick={loadMorePosts}
        >Load more</div>
      )
      return postElements
    }
  }

    return (
      <div className="home-wrapper">
        <div className="home-posts-wrapper">
          {homePostElement()}
        </div>
        <div className="home-right-column-container">
          <NewPost circles={circles}
                   me={me}
                   api={props.api}
                   resharePostData={resharePostData}
                   updateResharePostData={updateResharePostData}/>
          <NotificationDropdown
            notifications={notifications}
            api={props.api}
            loadMoreNotifications={loadMoreNotifications}
          />
        </div>
      </div>
    )
}
