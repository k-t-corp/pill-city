import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import Api from './api/Api'
import withAuthRedirect from './hoc/withAuthRedirect'
import withNoAuthRedirect from './hoc/withNoAuthRedirect'
import withNavBar from './hoc/withNavBar/withNavBar'
import withApi from './hoc/withApi'
import SignIn from './pages/SignIn/SignIn'
import SignUp from './pages/SignUp/SignUp'
import Home from './pages/Home/Home'
import Circles from './pages/Circles/Circles'
import Users from './pages/Users/Users'
import Profile from './pages/Profile/Profile'
import withUserId from "./hoc/withUserId";
import withPostId from "./hoc/withPostId";
import Settings from './pages/Settings/Settings'
import Post from './pages/Post/Post'
import Notifications from "./pages/Notifications/Notifications";
import Admin from "./pages/Admin/Admin";
import ToastProvider from "./components/Toast/ToastProvider";

const api = new Api(process.env.REACT_APP_API_ENDPOINT)

export default class App extends Component {
  render() {
    return (
      <ToastProvider>
        <Router>
          <Switch>
            <Route
              exact={true}
              path='/'
              component={withApi(withAuthRedirect(withNavBar(Home, '/')), api)}
            />
            <Route
              path='/post/:id'
              component={withPostId(withApi(withAuthRedirect(withNavBar(Post, '/post')), api))}
            />
            <Route
              path="/profile/:id"
              component={withUserId(withApi(withAuthRedirect(withNavBar(Profile, '/profile')), api))}
            />
            <Route
              path="/profile"
              component={withApi(withAuthRedirect(withNavBar(Profile, '/profile')), api)}
            />
            <Route
              path="/notifications"
              component={withApi(withAuthRedirect(withNavBar(Notifications, '/notifications')), api)}
            />
            <Route
              path="/users"
              component={withApi(withAuthRedirect(withNavBar(Users, '/users')), api)}
            />
            <Route
              path="/signup"
              component={withApi(withNoAuthRedirect(SignUp), api)}
            />
            <Route
              path="/signin"
              component={withApi(withNoAuthRedirect(SignIn), api)}
            />
            <Route
              path="/circles"
              component={withApi(withAuthRedirect(withNavBar(Circles, '/circles')), api)}
            />
            <Route
              path="/settings"
              component={withApi(withAuthRedirect(withNavBar(Settings, '/settings')), api)}
            />
            <Route
              path="/admin"
              component={withApi(withAuthRedirect(Admin, '/admin'), api)}
            />
            <Redirect to='/'/>
          </Switch>
        </Router>
      </ToastProvider>

    );
  }
}
