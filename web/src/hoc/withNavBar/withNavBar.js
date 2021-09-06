import React, {Component} from 'react'
import {Redirect} from 'react-router-dom'
import "./withNavBar.css"
import NavBar from "../../components/NavBar/NavBar";

export default (WrappedComponent, path) => {
  return class extends Component {
    constructor(props) {
      super(props)
      this.state = {
        'redirectTo': undefined,
      }
    }

    updateRedirectTo = (path) => {
      this.setState({'redirectTo': path})
    }

    render() {
      if (this.state.redirectTo !== undefined && this.state.redirectTo !== path) {
        return <Redirect to={this.state.redirectTo}/>
      }

      return (<NavBar wrappedComponent={<WrappedComponent {...this.props}/>} path={path} updateRedirectTo={this.updateRedirectTo}/>)
    }
  }
}
