import React, {useEffect, useRef, useState} from 'react'
import Picker from 'emoji-picker-react';
import "./Post.css"

export default (props) => {
  const [addComment, updateAddComment] = useState(false)
  const [replyNestedCommentId, updateReplayNestedCommentId] = useState("")
  const [showEmojiPicker, updateShowEmojiPicker] = useState(false)
  const [reactionData, setReactionData] = useState(props.data.reactions)
  const timePosted = (postedAtSeconds) => {
    const currentTimeAtSeconds = new Date().getTime() / 1000;
    const deltaAtSeconds = currentTimeAtSeconds - postedAtSeconds
    if (deltaAtSeconds < 60) {
      return `${Math.floor(deltaAtSeconds)}s`
    } else if (deltaAtSeconds < 3600) {
      return `${Math.floor(deltaAtSeconds / 60)}m`
    } else if (deltaAtSeconds < 3600 * 24) {
      return `${Math.floor(deltaAtSeconds / 3600)}h`
    } else if (deltaAtSeconds < 3600 * 24 * 7) {
      return `${Math.floor(deltaAtSeconds / (3600 * 24))}d`
    } else {
      return new Date(postedAtSeconds).toISOString().split('T')[0];
    }
  }
  const parseContent = (content, className) => {
    const regExForStrikeThrough = / -(.+)- /g
    const regExForItalic = / _(.+)_ /g
    const regExForBold = / \*(.+)\* /g
    let newContent = content.replace(regExForStrikeThrough, '<del>$1</del>');
    newContent = newContent.replace(regExForItalic, '<i>$1</i>')
    newContent = newContent.replace(regExForBold, '<b>$1</b>')
    return <div className={className} dangerouslySetInnerHTML={{__html: newContent}}/>
  }

  const updateReactions = () => {
    let reactionElements = []
    for (const [emoji, reactionDetail] of Object.entries(reactionData)) {
      reactionElements.push(
        <div className="post-reaction" key={`${props.data.id}-${emoji}`}>
          <span className="post-emoji">{emoji}</span><span>&nbsp;{reactionDetail.length}</span>
        </div>
      )
    }
    return reactionElements
  }
  let reactions = updateReactions()
  useEffect(() => {
    reactions = updateReactions()
  }, [reactionData])

  const addNewReactionOnClick = () => {
    // show emoji picker
    updateShowEmojiPicker(true)
  }

  const onEmojiClick = async (event, emojiObject) => {
    updateShowEmojiPicker(false)
    const emoji = emojiObject.emoji

    try {
      const res = await props.api.addReaction(emoji, props.data.id)
      setReactionData({
        ...reactionData,
        [emoji]: [
          ...(reactionData[emoji] || []),
          { author: props.me.id, reactionId: res.id}
        ]
      })
    } catch (e) {
      console.log(e)
    }
  }

  function closePickerWhenClickOutside(ref) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          updateShowEmojiPicker(false)
        }
      }

      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  const emojiPickerRef = useRef(null);
  closePickerWhenClickOutside(emojiPickerRef);

  reactions.push(
    <div key={'add-reaction'}>
      <div className="post-reaction" onClick={addNewReactionOnClick}>
        <span className="post-emoji" role="img" aria-label="Add Reaction">➕</span>
        {Object.keys(props.data.reactions).length === 0 ? "Add Reaction" : null}
      </div>
      {showEmojiPicker ? <div id="post-reaction-emoji-picker-wrapper" ref={emojiPickerRef}>
          <div className="post-reaction-emoji-picker">
            <Picker onEmojiClick={onEmojiClick}/>
          </div>
        </div>
        : null}
    </div>
  )

  let comments = []
  for (let i = 0; i < props.data.comments.length; i++) {
    const comment = props.data.comments[i]
    const replyButtonOnclick = () => {
      updateAddComment(true)
      updateReplayNestedCommentId(comment.id)
    }
    let nestedComments = []
    for (let i = 0; i < comment.comments.length; i++) {
      const nestedComment = comment.comments[i]
      nestedComments.push(
        <div key={i} className="post-nested-comment">
          <div className="post-avatar post-nested-comment-avatar">
            <img className="post-avatar-img" src={`${process.env.PUBLIC_URL}/kusuou.png`} alt=""/>
          </div>
          <div className="post-name nested-comment-name">{nestedComment.author.id}:&nbsp;</div>
          <div className="post-nested-comment-content">
            {parseContent(nestedComment.content, "")}
            <span className="post-time post-nested-comment-time">{timePosted(nestedComment.created_at_seconds)}</span>
            <span className="post-comment-reply-btn" onClick={replyButtonOnclick}>
              Reply
            </span>
          </div>
        </div>
      )
    }
    comments.push(
      <div className="post-comment" key={i}>
        <div className="post-avatar post-comment-avatar">
          <img className="post-avatar-img" src={`${process.env.PUBLIC_URL}/kusuou.png`} alt=""/>
        </div>
        <div className="post-comment-main-content">
          <div className="post-comment-info">
            <div className="post-name post-comment-name">
              {comment.author.id}
            </div>
            <div className="post-time">
              {timePosted(comment.created_at_seconds)}
            </div>
          </div>
          <div className="post-content comment-content">
            {parseContent(comment.content, "")}
            <span className="post-comment-reply-btn" onClick={replyButtonOnclick}>
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
    updateAddComment(true)
  }

  const postCommentButtonOnClick = async () => {
    const content = document.getElementById("post-comment-box-input").value
    if (replyNestedCommentId !== "") {
      // reply rested comment
      await props.api.postNestedComment(content, props.data.id, replyNestedCommentId)
      updateReplayNestedCommentId("")
    } else {
      await props.api.postComment(content, props.data.id)
    }
    window.location.reload()
  }

  let sharingScope
  if (props.data.is_public) {
    sharingScope = 'Public'
  } else if (props.data.circles.length !== 0) {
    sharingScope = props.data.circles.map(c => c.name).join(', ')
  } else {
    sharingScope = 'Only you'
  }

  return (
    <div className="post-wrapper">
      <div className="post-op">
        <div className="post-op-info-wrapper">
          <div className="post-op-info-left">
            <div className="post-avatar">
              <img className="post-avatar-img" src={`${process.env.PUBLIC_URL}/kusuou.png`} alt=""/>
            </div>
            <div className="post-name">
              {props.data.author.id}
            </div>
            <div className="post-visibility">
              &#x25B8; {sharingScope}
            </div>
          </div>
          <div className="post-op-info-right">
            <div className="post-op-info-time">
              {timePosted(props.data.created_at_seconds)}
            </div>
          </div>
        </div>
        {parseContent(props.data.content, "post-content")}
        <div className="post-interactions-wrapper">
          <div className="post-reactions-wrapper">
            {reactions}
          </div>
          <div className="post-interactions">
            <div className="post-circle-button" onClick={commentButtonOnClick}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"/>
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
              <img className="post-avatar-img" src={`${process.env.PUBLIC_URL}/kusuou.png`} alt=""/>
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


