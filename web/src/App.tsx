import React, {useEffect} from 'react';
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
import {useInterval} from "react-interval-hook";
import {useAppDispatch} from "./store/hooks";
import {loadPosts, pollPosts} from "./store/homeSlice";
import {loadMe} from "./store/meSlice";
import {loadNotifications, pollNotifications} from "./store/notificationsSlice";
import {Api} from "./api/Api";

export default () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!Api.isUnauthorized()) {
      // those dispatches are intentionally left not async so that they can run in parallel maybe?
      dispatch(loadMe())
      dispatch(loadPosts())
      dispatch(loadNotifications())
    }
  }, [])

  useInterval(() => {
    if (!Api.isUnauthorized()) {
      // those dispatches are intentionally left not async so that they can run in parallel maybe?
      // dispatch(pollPosts())
      dispatch(pollNotifications())
    }
  }, 5000)

  return (
    <ToastProvider>
      <Router>
        <Switch>
          <Route exact={true} path='/'>
            <Home />
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
