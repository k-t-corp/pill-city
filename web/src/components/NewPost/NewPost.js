import React from 'react'
import "./NewPost.css"

export default (props) => {
  return(
    <div className="new-post">
      <div className="new-post-user-info">
        <div className="new-post-avatar">
          <img className="new-post-avatar-img" src={`${process.env.PUBLIC_URL}/kusuou.PNG`} alt=""/>
        </div>
        <div className="new-post-name">
          {props.data.user.id}
        </div>
      </div>
      <textarea className="new-post-text-box"/>
      <div className="new-post-btns">
        <div className="new-post-post-btn">
          Post
        </div>
      </div>

    </div>
  )
}
