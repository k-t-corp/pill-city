import React, {useEffect, useState} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import SignIn from './pages/SignIn/SignIn'
import SignUp from './pages/SignUp/SignUp'
import Home from './pages/Home/Home'
import Circles from './pages/Circles/Circles'
import Users from './pages/Users/Users'
import Profile from './pages/Profile/Profile'
import Settings from './pages/Settings/Settings'
import Post from './pages/Post/Post'
import Notifications from "./pages/Notifications/Notifications";
import Admin from "./pages/Admin/Admin";
import ToastProvider from "./components/Toast/ToastProvider";
import PostModel from "./models/Post";
import api from "./api/Api";
import {useInterval} from "react-interval-hook";

export default () => {
  /**
   * Home states
   */
  const [homePostsLoading, updateHomePostsLoading] = useState(true)
  const [homePosts, updateHomePosts] = useState<PostModel[]>([])
  const [homePostsLoadingMore, updateHomePostsLoadingMore] = useState(false)
  const [homePostsPolling, updateHomePostsPolling] = useState(false)
  const [homePostsNoMore, updateHomePostsNoMore] = useState(false)

  useEffect(() => {
    (async () => {
      updateHomePosts(await api.getHome())
      updateHomePostsLoading(false)
    })()
  }, [])

  const pollHomePosts = async () => {
    if (homePosts.length === 0 || homePostsLoading || homePostsPolling) {
      return
    }
    updateHomePostsPolling(true)
    const newPosts = await api.pollHome(homePosts[0].id)
    updateHomePosts([...newPosts, ...homePosts])
    updateHomePostsPolling(false)
  }

  useInterval(pollHomePosts, 5000)

  const loadMoreHomePosts = async () => {
    if (homePostsLoadingMore) {
      return
    }
    updateHomePostsLoadingMore(true)
    const lastPost = homePosts[homePosts.length - 1]
    const newPosts = await api.getHome(lastPost['id'])
    if (newPosts.length !== 0) {
      updateHomePosts(homePosts.concat(newPosts))
    } else {
      updateHomePostsNoMore(true)
    }
    updateHomePostsLoadingMore(false)
  }

  /**
   * Notification states
   */
  // TODO

  return (
    <ToastProvider>
      <Router>
        <Switch>
          <Route exact={true} path='/'>
            <Home
              postsLoading={homePostsLoading}
              posts={homePosts}
              postsLoadingMore={homePostsLoadingMore}
              postsPolling={homePostsPolling}
              postsNoMore={homePostsNoMore}
              pollPosts={pollHomePosts}
              loadMorePosts={loadMoreHomePosts}
            />
          </Route>
          <Route path='/post/:id'>
            <Post />
          </Route>
          <Route path="/profile/:id">
            <Profile />
          </Route>
          <Route path="/profile">
            <Profile />
          </Route>
          <Route path="/notifications">
            <Notifications />
          </Route>
          <Route path="/users">
            <Users />
          </Route>
          <Route path="/signup">
            <SignUp />
          </Route>
          <Route path="/signin">
            <SignIn />
          </Route>
          <Route path="/circles">
            <Circles />
          </Route>
          <Route path="/settings">
            <Settings />
          </Route>
          <Route path="/admin">
            <Admin />
          </Route>
          <Redirect to='/'/>
        </Switch>
      </Router>
    </ToastProvider>
  );
}
