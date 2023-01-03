import RoundAvatar from "../RoundAvatar/RoundAvatar";
import ClickableId from "../ClickableId/ClickableId";
import {pastTime} from "../../utils/timeDelta";
import React, {useState} from "react";
import Post, {NestedComment, Comment} from "../../models/Post";
import User from "../../models/User";
import api from "../../api/Api";
import './NestedComment.css'
import {DotsVerticalIcon, ReplyIcon} from "@heroicons/react/solid";
import PillDropdownMenu from "../PillDropdownMenu/PillDropdownMenu";
import MediaV2Collage from "../MediaV2Collage/MediaV2Collage";
import EntityState from "../../models/EntityState";
import FormattedContent from "../FormattedContent/FormattedContent";

interface Props {
  me: User
  nestedComment: NestedComment
  parentComment: Comment
  post: Post
  highlightCommentId?: string
  highlightCommentRef: any
  onReply: (nestedComment: NestedComment) => void
  onHighlightComment: (nestedCommentId: string) => void
}

const NestedCommentComponent = (props: Props) => {
  const { nestedComment, parentComment, post } = props
  const isHighlightComment = props.highlightCommentId === nestedComment.id
  const [ state, updateState ] = useState<EntityState>(nestedComment.state)
  const [ deleting, updateDeleting ] = useState(false)
  const deleted = state === "deleted"
  const blocked = state === 'author_blocked'

  if (nestedComment.state === 'invisible') {
    return null
  }

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
    updateState("deleted")
    updateDeleting(false)
  }

  return (
    <div
      id={nestedComment.id}
      ref={isHighlightComment ? props.highlightCommentRef : null}
      className={`post-nested-comment ${isHighlightComment ? "highlight-comment" : ""}`}
    >
      <div className="post-nested-comment-avatar">
        <RoundAvatar user={!deleting && !deleted && !blocked ? nestedComment.author : null}/>
      </div>
      <div className="post-nested-comment-name">
        <ClickableId user={!deleting && !deleted && !blocked ? nestedComment.author : null}/>:&nbsp;
      </div>
      {
        !deleting && !deleted && nestedComment.reply_to_comment_id &&
        <div className='post-nested-comment-reply-to' onClick={e => {
          e.preventDefault()
          props.onHighlightComment(nestedComment.reply_to_comment_id)
        }}>
          <ReplyIcon />
        </div>
      }
      <div className="post-nested-comment-content">
        {
          !deleting && !deleted ?
            !blocked ?
              nestedComment.formatted_content && <FormattedContent fc={nestedComment.formatted_content}/> :
            <div style={{fontStyle: 'italic'}}>This user is blocked</div> :
          <div style={{fontStyle: 'italic'}}>This comment has been deleted</div>
        }
        {
          !deleting && !deleted && !blocked && nestedComment.media_urls_v2.length > 0 &&
          <div>
            <MediaV2Collage mediaUrls={[nestedComment.media_urls_v2[0]]}/>
          </div>
        }
        <div className='post-nested-comment-actions'>
          <span className="post-nested-comment-time">{pastTime(nestedComment.created_at_seconds)}</span>
          {
            !deleting && !deleted && !blocked && parentComment.state !== 'deleted' &&
            <span className="post-nested-comment-reply-btn" onClick={onReply}>
            Reply
          </span>
          }
          {
            !deleting && !deleted && nestedComment.author.id === props.me.id &&
            <PillDropdownMenu
              items={[
                {
                  text: 'Delete',
                  onClick: onDelete
                }
              ]}
            >
              <div className="post-nested-comment-more-actions-trigger">
                <DotsVerticalIcon />
              </div>
            </PillDropdownMenu>
          }
        </div>
      </div>
    </div>
  )
}

export default NestedCommentComponent
