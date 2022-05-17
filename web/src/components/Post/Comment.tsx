import RoundAvatar from "../RoundAvatar/RoundAvatar";
import ClickableId from "../ClickableId/ClickableId";
import {pastTime} from "../../utils/timeDelta";
import parseContent from "../../utils/parseContent";
import MediaPane from "../MediaPane/MediaPane";
import React, {useState} from "react";
import {Comment} from "../../models/Post";
import User from "../../models/User";
import Post, {NestedComment as NestedCommentModel} from "../../models/Post";
import NestedComment from "./NestedComment";
import api from "../../api/Api";
import "./Comment.css"
import {DotsVerticalIcon} from "@heroicons/react/solid";
import PillDropdownMenu from "../PillDropdownMenu/PillDropdownMenu";

interface Props {
  me: User
  comment: Comment
  post: Post
  detail: boolean
  highlightCommentId?: string
  highlightCommentRef: any
  onReply: () => void
  onNestedCommentReply: (nestedComment: NestedCommentModel) => void
}

export default (props: Props) => {
  const { comment } = props
  const isHighlightComment = props.highlightCommentId
  const [ deleting, updateDeleting ] = useState(false)
  const [ deleted, updateDeleted ] = useState(comment.deleted)

  const nestedCommentElems = []
  for (let i = 0; i < comment.comments.length; i++) {
    const nestedComment = comment.comments[i]
    nestedCommentElems.push(
      <NestedComment
        key={nestedComment.id}
        me={props.me}
        nestedComment={nestedComment}
        parentComment={comment}
        post={props.post}
        highlightCommentId={props.highlightCommentId}
        highlightCommentRef={props.highlightCommentRef}
        onReply={props.onNestedCommentReply}
      />
    )
  }

  const onReply = () => {
    if (deleting) {
      return
    }
    props.onReply()
  }

  const onDelete = async () => {
    if (deleting) {
      return
    }
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return
    }
    updateDeleting(true)
    await api.deleteComment(props.post.id, comment.id)
    updateDeleted(true)
    updateDeleting(false)
  }

  return (
    <div
      id={comment.id}
      ref={isHighlightComment ? props.highlightCommentRef : null}
      className={`post-comment ${isHighlightComment ? "highlight-comment" : ""}`}
    >
      <div className="post-comment-avatar">
        <RoundAvatar user={!deleted ? comment.author : null}/>
      </div>
      <div className="post-comment-main-content">
        <div className="post-comment-name">
          <ClickableId user={!deleted ? comment.author : null}/>
        </div>
        <div className={`post-comment-content ${props.detail ? '' : 'post-comment-content-summary'}`}>
          {
            !deleted ?
              parseContent(comment.content, "") :
              <div style={{fontStyle: 'italic'}}>This comment has been deleted</div>
          }
          {
            !deleted && comment.media_urls.length > 0 &&
            <div>
              <MediaPane mediaUrls={[comment.media_urls[0]]}/>
            </div>
          }
        </div>
        <div className='post-comment-actions'>
          <div className="post-time">
            {pastTime(comment.created_at_seconds)}
          </div>
          {
            !deleting && !deleted &&
            <span className="post-comment-reply-btn" onClick={onReply}>
              Reply
            </span>
          }
          {
            !deleting && !deleted && comment.author.id === props.me.id &&
            <PillDropdownMenu
              items={[
                {
                  text: 'Delete',
                  onClick: onDelete
                }
              ]}
            >
              <div className="post-comment-more-actions-trigger">
                <DotsVerticalIcon />
              </div>
            </PillDropdownMenu>

          }
        </div>
        {nestedCommentElems}
      </div>
    </div>
  )
}
