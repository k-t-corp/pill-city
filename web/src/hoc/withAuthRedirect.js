import React, {Component} from 'react'
import {accessTokenExists, getAccessToken} from "../api/AuthStorage";
import {Redirect} from "react-router-dom";

export default (WrappedComponent) => {
  return class extends Component {
    render() {
      if (accessTokenExists()) {
        const authentication = getAccessToken()
        return (<WrappedComponent authentication={authentication} {...this.props}/>)
      } else {
        return (<Redirect to='/signin'/>)
      }
    }
  }
}
