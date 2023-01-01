import React, {useEffect, useRef, useState} from 'react'
import {pastTime} from "../../utils/timeDelta";
import {useHistory} from "react-router-dom";
import RoundAvatar from "../RoundAvatar/RoundAvatar";
import Reactions from "./Reactions";
import ResharedPost from "./ResharedPost";
import ClickableId from "../ClickableId/ClickableId";
import Comment from "./Comment";
import CommentBox from "./NewComment";
import Post, {Comment as CommentModel, ResharedPost as ResharedPostModel, NestedComment as NestedCommentModel} from "../../models/Post";
import User from "../../models/User";
import LinkPreviews from "./LinkPreviews";
import api from "../../api/Api";
import {
  BanIcon,
  ChatIcon,
  DotsVerticalIcon,
  ShareIcon
} from "@heroicons/react/solid";
import PillDropdownMenu from "../PillDropdownMenu/PillDropdownMenu";
import MediaCollage from "../MediaCollage/MediaCollage";
import "./Post.css"
import Poll from '../Poll/Poll';
import PostAttachments, {PostAttachment} from "./PostAttachments";
import EntityState from "../../models/EntityState";
import FormattedContent from "../FormattedContent/FormattedContent";

interface Props {
  post: Post
  highlightCommentId?: string
  me: User
  detail: boolean
  hasNewPostModal: boolean,
  updateNewPostOpened: (arg0: boolean) => void
  updateResharedPost: (arg0: Post | ResharedPostModel | null) => void
  disableNavigateToPostPage?: true
}

const PostComponent = (props: Props) => {


  const [state, updateState] = useState<EntityState>(props.post.state)
  const [deleting, updateDeleting] = useState(false)
  const deleted = state === 'deleted'
  const blocked = state === 'author_blocked'
  const [commentContent, updateCommentContent] = useState('')

  // existing comment data cached in state
  const [comments, updateComments] = useState(props.post.comments)
  // whether the comment box is expanded
  const [addingComment, updateAddingComment] = useState(false)
  // currently replying to comment
  const [replyingToComment, updateReplyingToComment] = useState<CommentModel | null>(null)
  // currently replying to nested comment
  const [replyingToNestedComment, updateReplyingToNestedComment] = useState<NestedCommentModel | null>(null)

  const [mediaUrls, updateMediaUrls] = useState(props.post.media_urls_v2)

  const history = useHistory()

  const highlightCommentId = props.highlightCommentId
  const highlightCommentRef = useRef(null)
  useEffect(() => {
    if (highlightCommentId && highlightCommentRef) {
      (highlightCommentRef as any).current.scrollIntoView({behavior: 'smooth'})
    }
  }, [highlightCommentRef, highlightCommentId])

  if (props.post.state === 'invisible') {
    return null
  }

  let commentElems = []
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i]

    commentElems.push(
      <Comment
        key={comment.id}
        me={props.me}
        comment={comment}
        post={props.post}
        detail={props.detail}
        highlightCommentId={highlightCommentId}
        highlightCommentRef={highlightCommentRef}
        onReply={() => {
          updateAddingComment(true)
          updateReplyingToComment(comment)
          updateReplyingToNestedComment(null)
        }}
        onNestedCommentReply={(nestedComment) => {
          updateAddingComment(true)
          updateReplyingToComment(comment)
          updateReplyingToNestedComment(nestedComment)
        }}
      />
    )
  }

  const deletePost = async () => {
    if (deleting) {
      return
    }
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return
    }
    updateDeleting(true)
    await api.deletePost(props.post.id)
    updateState('deleted')
    updateDeleting(false)
  }

  const deletePostMedia = async () => {
    if (mediaUrls.length === 0) {
      return
    }
    if (!window.confirm('Are you sure you want to delete all media of this post?')) {
      return
    }
    updateMediaUrls([])
    await api.deletePostMedia(props.post.id)
  }

  const reshareButtonOnClick = () => {
    if (props.hasNewPostModal) {
      props.updateNewPostOpened(true)
    }
    if (props.post.reshared_from === null) {
      props.updateResharedPost(props.post)
    } else {
      props.updateResharedPost(props.post.reshared_from)
    }
  }

  let sharingScope
  if (props.post.is_public) {
    sharingScope = 'Public'
  } else if (props.post.circles.length !== 0) {
    let circleNames: string[] = []
    let circlesCount = 0
    for (let circle of props.post.circles) {
      if ("name" in circle) {
        circleNames = [...circleNames, circle.name]
      } else {
        circlesCount += 1
      }
    }
    if (circleNames.length > 0) {
      sharingScope = circleNames.join(', ')
    } else if (circlesCount === 0) {
      sharingScope = 'Only you'
    } else if (circlesCount === 1) {
      sharingScope = '1 circle'
    } else {
      sharingScope = `${circlesCount} circles`
    }
  } else {
    sharingScope = 'Only you'
  }

  const disableNavigateToPostPage = props.disableNavigateToPostPage === true
  const navigateToPostPage = (e: any) => {
    e.preventDefault();
    if (!disableNavigateToPostPage) {
      history.push(`/post/${props.post.id}`)
    }
  }

  const commentButtonOnClick = () => {
    updateAddingComment(!addingComment)
    updateReplyingToComment(null)
  }

  const postAttachments: PostAttachment[] = []
  if (props.post.reshared_from) {
    postAttachments.push({
      title: 'Reshared post',
      el: <ResharedPost
        key={'reshared-post'}
        resharedFrom={props.post.reshared_from}
        showDetail={props.detail}
        me={props.me}
      />
    })
  }
  if (props.post.poll !== null) {
    postAttachments.push({
      title: 'Poll',
      el: <Poll
        key={'post-poll'}
        poll={props.post.poll}
        postId={props.post.id}
        me={props.me}
      />
    })
  }
  if (mediaUrls.length > 0) {
    postAttachments.push({
      title: 'Media',
      el: <MediaCollage
        key={'post-media'}
        mediaUrls={mediaUrls}
      />})
  }
  if (props.post.link_previews.length > 0) {
    postAttachments.push({
      title: 'Link Previews',
      el: <LinkPreviews
        key={'post-link-previews'}
        post={props.post}
      />
    })
  }

  return (
    <div className="post-wrapper">
      <div className="post-op">
        <div className="post-op-info-wrapper">
          <div className="post-op-info-left">
            <div className="post-avatar">
              <RoundAvatar user={!blocked ? props.post.author : null}/>
            </div>
            <div className="post-name">
              <ClickableId user={!blocked ? props.post.author : null}/>
            </div>
            <div className="post-visibility">
              &#x25B8; {sharingScope}
            </div>
          </div>
          <div>
            <div className="post-op-info-time" onClick={navigateToPostPage} style={{
              cursor: disableNavigateToPostPage ? 'auto' : 'pointer'
            }}>
              {pastTime(props.post.created_at_seconds)}
            </div>
            {
              props.me.id === props.post.author.id && !deleted && !deleting &&
              <PillDropdownMenu
                items={
                  mediaUrls.length > 0 && props.post.content ? [
                    {
                      text: 'Delete all media',
                      onClick: deletePostMedia
                    },
                    {
                      text: 'Delete post',
                      onClick: deletePost
                    }
                  ] : [
                    {
                      text: 'Delete post',
                      onClick: deletePost
                    }
                  ]
                }
              >
                <div className="post-more-actions-trigger">
                  <DotsVerticalIcon />
                </div>
              </PillDropdownMenu>
            }
          </div>
        </div>
        <div>
          {
            !deleting && !deleted ?
              !blocked ?
                !props.post.is_update_avatar ?
                  props.post.formatted_content && <FormattedContent fc={props.post.formatted_content} className='post-content'/>
                  :
                  <div className='post-content' style={{fontStyle: 'italic'}}>@{props.post.author.id} has a new
                    avatar!</div> :
                <div className='post-content' style={{fontStyle: 'italic'}}>This user is blocked</div>
              :
              <div className='post-content' style={{fontStyle: 'italic'}}>This post has been deleted</div>
          }
        </div>
        {!deleting && !deleted && !blocked &&
          <div className='post-attachments-wrapper'>
            <PostAttachments attachments={postAttachments}/>
          </div>
        }
        {!deleting && !deleted && !blocked &&
          <div className="post-interactions-wrapper">
            <Reactions
              reactions={props.post.reactions}
              me={props.me}
              postId={props.post.id}
            />
            <div className="post-interactions">
              <div className="post-circle-button" onClick={commentButtonOnClick}>
                <ChatIcon />
              </div>
              {props.post.reshareable ?
                <div className="post-circle-button" onClick={reshareButtonOnClick}>
                  <ShareIcon />
                </div>
                :
                <div className="post-circle-button">
                  <BanIcon />
                </div>
              }
            </div>
          </div>
        }
        {addingComment && <CommentBox
          me={props.me}
          post={props.post}
          content={commentContent}
          updateContent={updateCommentContent}
          replyingToComment={replyingToComment}
          replyingToNestedComment={replyingToNestedComment}
          addComment={(newComment) => {
            updateComments([...comments, newComment])
          }}
          addNestedComment={(newNestedComment) => {
            updateComments(comments.map(c => {
              if (replyingToComment && c.id !== replyingToComment.id) {
                return c
              }
              return {
                ...c,
                comments: [...c.comments, newNestedComment]
              }
            }))
          }}
          afterSendingComment={() => {
            updateAddingComment(false)
            updateReplyingToComment(null)
          }}
        />}
      </div>
      {comments.length === 0 ? null :
        <div className="post-comments-wrapper">
          {commentElems}
        </div>
      }
    </div>
  )
}

export default PostComponent
