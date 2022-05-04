import RoundAvatar from "../RoundAvatar/RoundAvatar";
import ClickableId from "../ClickableId/ClickableId";
import parseContent from "../../utils/parseContent";
import MediaPane from "../MediaPane/MediaPane";
import timePosted from "../../utils/timePosted";
import React, {useState} from "react";
import Post, {NestedComment, Comment} from "../../models/Post";
import User from "../../models/User";
import api from "../../api/Api";
import './NestedComment.css'

interface Props {
  me: User
  nestedComment: NestedComment
  parentComment: Comment
  post: Post
  highlightCommentId?: string
  highlightCommentRef: any
  onReply: (nestedComment: NestedComment) => void
}

export default (props: Props) => {
  const { nestedComment, parentComment, post } = props
  const isHighlightComment = props.highlightCommentId === nestedComment.id
  const [ deleted, updateDeleted ] = useState(nestedComment.deleted)
  const [ deleting, updateDeleting ] = useState(false)

  const onReply = () => {
    if (deleting) {
      return
    }
    props.onReply(nestedComment)
  }

  const onDelete = async () => {
    if (deleting) {
      return
    }
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return
    }
    // mark as deleting
    updateDeleting(true)
    await api.deleteNestedComment(post.id, parentComment.id, nestedComment.id)
    // mark as deleted and not deleting
    updateDeleted(true)
    updateDeleting(false)
  }

  return (
    <div
      id={nestedComment.id}
      ref={isHighlightComment ? props.highlightCommentRef : null}
      className={`post-nested-comment ${isHighlightComment ? "highlight-comment" : ""}`}
    >
      <div className="post-nested-comment-avatar">
        <RoundAvatar user={!deleted ? nestedComment.author : null}/>
      </div>
      <div className="post-nested-comment-name">
        <ClickableId user={!deleted ? nestedComment.author : null}/>:&nbsp;
      </div>
      <div className="post-nested-comment-content">
        {
          !deleted ?
            parseContent(nestedComment.content, "") :
            <div style={{fontStyle: 'italic'}}>This comment has been deleted</div>
        }
        {
          !deleted && nestedComment.media_urls.length > 0 &&
          <div>
            <MediaPane mediaUrls={[nestedComment.media_urls[0]]}/>
          </div>
        }
        <span className="post-nested-comment-time">{timePosted(nestedComment.created_at_seconds)}</span>
        {
          !deleting && !deleted && !parentComment.deleted &&
          <span className="post-comment-reply-btn" onClick={onReply}>
            Reply
          </span>
        }
        {
          !deleting && !deleted && nestedComment.author.id === props.me.id &&
          <span className="post-comment-delete-btn" onClick={onDelete}>
            Delete
          </span>
        }
      </div>
    </div>
  )
}
