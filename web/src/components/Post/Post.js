import React, {useState} from 'react'
import "./Post.css"

export default (props) => {
  const [addComment, updateAddComment] = useState(false)
  let reactions = []
  for (let i = 0; i < props.data.reactions.length; i++) {
    const reaction = props.data.reactions[i]
    reactions.push(
      <div className="post-reaction" key={i}>
        <span className="post-emoji">{reaction.emoji}</span><span>&nbsp;{reaction.count}</span>
      </div>
    )
  }

  reactions.push(
    <div className="post-reaction" key={props.data.reactions.length}>
      <span className="post-emoji">➕</span>
      {props.data.reactions.length === 0 ? "Add Reaction" : null}
    </div>
  )

  let comments = []
  for (let i = 0; i < props.data.comments.length; i++) {
    const comment = props.data.comments[i]
    let nestedComments = []
    for (let i = 0; i < comment.comments.length; i++) {
      const nestedComment = comment.comments[i]
      nestedComments.push(
        <div className="post-nested-comment">
          <div className="post-name nested-comment-name">{nestedComment.author.id}:&nbsp;</div>
          <div className="post-nested-comment-content">
            {nestedComment.content}
            <span className="post-time post-nested-comment-time">23d</span>
            <span className="post-comment-reply-btn">
              Reply
            </span>
          </div>
        </div>
      )
    }
    comments.push(
      <div className="post-comment" key={i}>
        <div className="post-avatar post-comment-avatar">
          <img className="post-avatar-img" src={`${process.env.PUBLIC_URL}/kusuou.PNG`} alt=""/>
        </div>
        <div className="post-comment-main-content">
          <div className="post-comment-info">
            <div className="post-name post-comment-name">
              {comment.author.id}
            </div>
            <div className="post-time">
              39d
            </div>
          </div>
          <div className="post-content comment-content">
            {comment.content}
            <span className="post-comment-reply-btn">
              Reply
            </span>
          </div>
          <div className="post-nested-comment-wrapper">
            {nestedComments}
          </div>
        </div>
      </div>
    )
  }

  const commentButtonOnClick = () => {
    updateAddComment(!addComment)
  }

  const postCommentButtonOnClick = () => {
    updateAddComment(false)
  }


  return (
    <div className="post-wrapper">
      <div className="post-op">
        <div className="post-op-info-wrapper">
          <div className="post-avatar">
            <img className="post-avatar-img" src={`${process.env.PUBLIC_URL}/kusuou.PNG`} alt=""/>
          </div>
          <div className="post-name">
            {props.data.author.id}
          </div>
          <div className="post-visibility">
            &#x25B8; {props.data.is_public ? "Public" : props.data.circles.join(", ")}
          </div>
        </div>
        <div className="post-content">
          {props.data.content}
        </div>
        <div className="post-interactions-wrapper">
          <div className="post-reactions-wrapper">
            {reactions}
          </div>
          <div className="post-interactions">
            <div className="post-circle-button" onClick={commentButtonOnClick}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clip-rule="evenodd"/>
              </svg>
            </div>
            <div className="post-circle-button">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      {props.data.comments.length === 0 ? null :
        <div className="post-comments-wrapper">
          {comments}
        </div>}

      {addComment ?
        <div className="post-comment-box-wrapper fade-in">
          <div className="post-comment-box-input-area">
            <div className="post-avatar post-comment-avatar">
              <img className="post-avatar-img" src={`${process.env.PUBLIC_URL}/kusuou.PNG`} alt=""/>
            </div>
            <textarea id="post-comment-box-input" placeholder="Add comment"/>
          </div>
          <div className="post-comment-box-buttons">
            <div className="post-comment-box-post-button" onClick={postCommentButtonOnClick}>
              Comment
            </div>
          </div>
        </div> : null}
    </div>)
}


