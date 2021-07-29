import React, {Component} from 'react'
import {cookieExists} from "../api/authCookie";
import {Redirect} from "react-router-dom";

export default (WrappedComponent) => {
  return class extends Component {
    render() {
      if (!cookieExists()) {
        return (<WrappedComponent {...this.props}/>)
      } else {
        return (<Redirect to='/'/>)
      }
    }
  }
}
