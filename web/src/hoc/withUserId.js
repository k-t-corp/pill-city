import React, {Component} from 'react'

export default (WrappedComponent) => {
  return class extends Component {
    render() {
      let id = this.props.match.params.id
      return (<WrappedComponent userId={id} {...this.props}/>)
    }
  }
}
