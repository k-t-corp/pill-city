import React, {ReactElement, useEffect} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect, useHistory
} from 'react-router-dom'
import SignIn from './pages/SignIn/SignIn'
import SignUp from './pages/SignUp/SignUp'
import Home from './pages/Home/Home'
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
import ForgetPassword from "./pages/ForgetPassword/ForgetPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import Modal from "react-modal";
import NavBar from "./components/NavBar/NavBar";
import {accessTokenExists} from "./api/AuthStorage";
import {getUseMultiColumn} from "./utils/SettingsStorage";
import './App.css'
import Circles from "./pages/Circles/Circles";
import {ErrorBoundary} from "react-error-boundary";

Modal.setAppElement('#root');

interface AuthenticatedProps {
  children: ReactElement
  freeWidth?: boolean
}

const Authenticated = (props: AuthenticatedProps) => {
  const history = useHistory();

  if (!accessTokenExists()) {
    const from = history.location.pathname;
    if (from !== '/signin') {
      return <Redirect to={`/signin?next=${history.location.pathname}`}/>
    } else {
      return <Redirect to={`/signin`}/>
    }
  }
  return (
    <>
      <NavBar />
      <div
        className="app-container"
        style={{maxWidth: getUseMultiColumn() && props.freeWidth ? undefined : '1200px'}}
      >
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

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: any
}

const ErrorFallback = (props: ErrorFallbackProps) => {
  return (
    <div>
      <p>Opps something went wrong</p>
      <p>Message: {props.error.message}</p>
      <p><a href="#" onClick={props.resetErrorBoundary}>Try again</a></p>
    </div>
  )
}

const App = () => {
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
            <Authenticated freeWidth={true}>
              <Home />
            </Authenticated>
          </Route>
          <Route path='/post/:id'>
            <Authenticated>
              <Post />
            </Authenticated>
          </Route>
          <Route path="/profile/:id">
            <Authenticated>
              <Profile />
            </Authenticated>
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

export default () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
    >
      <App />
    </ErrorBoundary>
  )
}
