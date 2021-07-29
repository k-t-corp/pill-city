import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import Api from './api/Api'
import withAuthRedirect from './hoc/withAuthRedirect'
import withNavBar from './hoc/withNavBar/withNavBar'
import withApi from './hoc/withApi'
import SignIn from './pages/SignIn/SignIn'
import SignUp from './pages/SignUp/SignUp'
import Home from './pages/Home/Home'
import Circles from './pages/Circles/Circles'
import Users from './pages/Users'
import Profile from './pages/Profile'

const api = new Api(process.env.REACT_APP_API_ENDPOINT)

export default class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route
            exact={true}
            path='/'
            component={withApi(withAuthRedirect(withNavBar(Home, '/')), api)}
          />
          <Route
            path="/profile"
            component={withApi(withAuthRedirect(withNavBar(Profile, '/profile')), api)}
          />
          <Route
            path="/users"
            component={withApi(withAuthRedirect(withNavBar(Users, '/users')), api)}
          />
          <Route
            path="/signup"
            component={withApi(SignUp, api)}
          />
          <Route
            path="/signin"
            component={withApi(SignIn, api)}
          />
          <Route path="/circles" component={withApi(withAuthRedirect(withNavBar(Circles, '/circles')), api)}/>
          <Redirect to='/'/>
        </Switch>
      </Router>
    );
  }
}
