import React, {ReactElement, useEffect} from 'react';
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
import './App.css'
import ForgetPassword from "./pages/ForgetPassword/ForgetPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import Modal from "react-modal";
import NavBar from "./components/NavBar/NavBar";
import {accessTokenExists} from "./api/AuthStorage";

Modal.setAppElement('#root');

const Authenticated = (props: {children: ReactElement}) => {
  if (!accessTokenExists()) {
    return <Redirect to='/signin'/>
  }
  return (
    <>
      <NavBar />
      <div className="app-container">
        {props.children}
      </div>
    </>
  )
}

const NotAuthenticated = (props: {children: ReactElement}) => {
  if (accessTokenExists()) {
    return <Redirect to='/'/>
  }
  return props.children
}

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
      dispatch(pollPosts())
      dispatch(pollNotifications())
    }
  }, 5000)

  return (
    <ToastProvider>
      <Router>
        <Switch>
          <Route exact={true} path='/'>
            <Authenticated>
              <Home />
            </Authenticated>
            <Home />
          </Route>
          <Route path='/post/:id'>
            <Authenticated>
              <Post />
            </Authenticated>
          </Route>
          <Route path="/profile/:id">
            <Profile />
          </Route>
          <Route path="/profile">
            <Authenticated>
              <Profile />
            </Authenticated>
          </Route>
          <Route path="/notifications">
            <Authenticated>
              <Notifications />
            </Authenticated>
          </Route>
          <Route path="/users">
            <Authenticated>
              <Users />
            </Authenticated>
          </Route>

          <Route path="/circles">
            <Authenticated>
              <Circles />
            </Authenticated>
          </Route>
          <Route path="/settings">
            <Authenticated>
              <Settings />
            </Authenticated>
          </Route>
          <Route path="/admin">
            <Authenticated>
              <Admin />
            </Authenticated>
          </Route>
          <Route path="/signup">
            <NotAuthenticated>
              <SignUp />
            </NotAuthenticated>
          </Route>
          <Route path="/signin">
            <NotAuthenticated>
              <SignIn />
            </NotAuthenticated>
          </Route>
          <Route path="/forget">
            <ForgetPassword />
          </Route>
          <Route path="/reset">
            <ResetPassword />
          </Route>
          <Redirect to='/'/>
        </Switch>
      </Router>
    </ToastProvider>
  );
}
