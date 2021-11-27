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
import {Api} from "./api/Api";
//@ts-ignore
import ScrollMemory from 'react-router-scroll-memory';

export default () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!Api.isUnauthorized()) {
      // @ts-ignore
      dispatch(loadPosts())
    }
  }, [])

  useInterval(() => {
    if (!Api.isUnauthorized()) {
      // @ts-ignore
      dispatch(pollPosts())
    }
  }, 5000)

  return (
    <ToastProvider>
      <Router>
        <ScrollMemory />
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
