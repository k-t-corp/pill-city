import React from 'react';
import NewPost from "../../components/NewPost/NewPost";
import "./MobileNewPost.css"

export default (props) => {
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target === document.getElementById("mobileNewPostModal")) {
      props.updateNewPostOpened(false)
    }
  }
  return (
    <div className="mobile-new-post-wrapper">
      <svg className="mobile-new-post-button"
           onClick={() => props.updateNewPostOpened(true)}
           xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path
          d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
      </svg>
      {props.newPostOpened &&
      <div id="mobileNewPostModal" className="mobile-new-post-modal">
        <div className="mobile-new-post-modal-content">
          <NewPost circles={props.circles}
                   me={props.me}
                   api={props.api}
                   resharePostData={props.resharePostData}
                   updateResharePostData={props.updateResharePostData}/>
        </div>
      </div>}
    </div>
  )
}
