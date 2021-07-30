import React, {Component} from 'react'
import {accessTokenExists} from "../api/AuthStorage";
import {Redirect} from "react-router-dom";

export default (WrappedComponent) => {
  return class extends Component {
    render() {
      if (!accessTokenExists()) {
        return (<WrappedComponent {...this.props}/>)
      } else {
        return (<Redirect to='/'/>)
      }
    }
  }
}
