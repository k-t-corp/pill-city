import React, {ReactElement, useEffect, useState} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
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
import {accessTokenExists} from "./api/AuthStorage";
import {getUseMultiColumn} from "./utils/SettingsStorage";
import './App.css'
import Circles from "./pages/Circles/Circles";
import {ErrorBoundary} from "react-error-boundary";
import {useMediaQuery} from "react-responsive";
import MobileNavBar from "./components/NavBar/MobileNavBar";
import DesktopNavBar from "./components/NavBar/DesktopNavBar";
import MobileHome from "./pages/MobileHome/MobileHome";

Modal.setAppElement('#root');

interface AuthenticatedProps {
  children: ReactElement
  updateMobilePage: (page: number) => void
  freeWidth?: boolean
}

const Authenticated = (props: AuthenticatedProps) => {
  if (!accessTokenExists()) {
    return <Redirect to='/signin'/>
  }

  const isMobile = useMediaQuery({query: '(max-width: 750px)'})

  return (
    <div>
      {
        isMobile ?
          <MobileNavBar currentPage={-1} onChangePage={props.updateMobilePage}/>:
          <DesktopNavBar />
      }
      <div
        className="app-container"
        style={{maxWidth: getUseMultiColumn() && props.freeWidth ? undefined : '1200px'}}
      >
        {props.children}
      </div>
    </div>
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

  const isMobile = useMediaQuery({query: '(max-width: 750px)'})
  const [mobileCurrentPage, updateMobileCurrentPage] = useState(2)

  return (
    <ToastProvider>
      <Router>
        <Switch>
          {/*unauthenticated*/}
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
          {/*sub pages*/}
          <Route path='/post/:id'>
            <Authenticated updateMobilePage={updateMobileCurrentPage}>
              <Post />
            </Authenticated>
          </Route>
          <Route path="/profile/:id">
            <Authenticated updateMobilePage={updateMobileCurrentPage}>
              <Profile />
            </Authenticated>
          </Route>
          <Route path="/settings">
            <Authenticated updateMobilePage={updateMobileCurrentPage}>
              <Settings />
            </Authenticated>
          </Route>
          <Route path="/admin">
            <Authenticated updateMobilePage={updateMobileCurrentPage}>
              <Admin />
            </Authenticated>
          </Route>
          {/*mobile main pages*/}
          <Route exact={true} path='/'>
            <Authenticated updateMobilePage={updateMobileCurrentPage} freeWidth={true}>
              {
                isMobile ?
                  <MobileHome currentPage={mobileCurrentPage} onChangePage={updateMobileCurrentPage}/>:
                  <Home />
              }
            </Authenticated>
          </Route>
          <Route path="/users">
            <Authenticated updateMobilePage={updateMobileCurrentPage}>
              {
                isMobile ?
                  <MobileHome currentPage={mobileCurrentPage} onChangePage={updateMobileCurrentPage}/> :
                  <Users />
              }
            </Authenticated>
          </Route>
          <Route path="/circles">
            <Authenticated updateMobilePage={updateMobileCurrentPage}>
              {
                isMobile ?
                  <MobileHome currentPage={mobileCurrentPage} onChangePage={updateMobileCurrentPage}/> :
                  <Circles />
              }
            </Authenticated>
          </Route>
          <Route path="/notifications">
            <Authenticated updateMobilePage={updateMobileCurrentPage}>
              {
                isMobile ?
                  <MobileHome currentPage={mobileCurrentPage} onChangePage={updateMobileCurrentPage}/> :
                  <Notifications />
              }
            </Authenticated>
          </Route>
          <Route path="/profile">
            <Authenticated updateMobilePage={updateMobileCurrentPage}>
              {
                isMobile ?
                  <MobileHome currentPage={mobileCurrentPage} onChangePage={updateMobileCurrentPage}/> :
                  <Profile />
              }
            </Authenticated>
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
