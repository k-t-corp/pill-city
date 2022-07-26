import React, {useEffect, useRef, useState} from 'react'
import {parseContentWithLinkPreviews} from "../../utils/parseContent";
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
  ChartSquareBarIcon,
  ChatIcon,
  DotsVerticalIcon,
  LinkIcon,
  PhotographIcon,
  ShareIcon
} from "@heroicons/react/solid";
import PillDropdownMenu from "../PillDropdownMenu/PillDropdownMenu";
import MediaCollage from "../MediaCollage/MediaCollage";
import "./Post.css"
import Poll from '../Poll/Poll';
import PillSlide, {Slide} from "../PillSlide/PillSlide";

interface Props {
  data: Post
  highlightCommentId?: string
  me: User
  detail: boolean
  hasNewPostModal: boolean,
  updateNewPostOpened: (arg0: boolean) => void
  updateResharePostData: (arg0: Post | ResharedPostModel | null) => void
  disableNavigateToPostPage?: true
}

export default (props: Props) => {
  const [deleted, updateDeleted] = useState(props.data.deleted)
  const [deleting, updateDeleting] = useState(false)
  const blocked = props.data.blocked
  const [commentContent, updateCommentContent] = useState('')

  // existing comment data cached in state
  const [comments, updateComments] = useState(props.data.comments)
  // whether the comment box is expanded
  const [addingComment, updateAddingComment] = useState(false)
  // currently replying to comment
  const [replyingToComment, updateReplyingToComment] = useState<CommentModel | null>(null)
  // currently replying to nested comment
  const [replyingToNestedComment, updateReplyingToNestedComment] = useState<NestedCommentModel | null>(null)

  const [mediaUrls, updateMediaUrls] = useState(props.data.media_urls_v2)

  const history = useHistory()

  const highlightCommentId = props.highlightCommentId
  const highlightCommentRef = useRef(null)
  useEffect(() => {
    if (highlightCommentId && highlightCommentRef) {
      (highlightCommentRef as any).current.scrollIntoView({behavior: 'smooth'})
    }
  }, [highlightCommentRef])

  let commentElems = []
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i]

    commentElems.push(
      <Comment
        key={comment.id}
        me={props.me}
        comment={comment}
        post={props.data}
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
    await api.deletePost(props.data.id)
    updateDeleted(true)
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
    await api.deletePostMedia(props.data.id)
  }

  const reshareButtonOnClick = () => {
    if (props.hasNewPostModal) {
      props.updateNewPostOpened(true)
    }
    if (props.data.reshared_from === null) {
      props.updateResharePostData(props.data)
    } else {
      props.updateResharePostData(props.data.reshared_from)
    }
  }

  let sharingScope
  if (props.data.is_public) {
    sharingScope = 'Public'
  } else if (props.data.circles.length !== 0) {
    let circleNames: string[] = []
    let circlesCount = 0
    for (let circle of props.data.circles) {
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
      history.push(`/post/${props.data.id}`)
    }
  }

  const commentButtonOnClick = () => {
    updateAddingComment(!addingComment)
    updateReplyingToComment(null)
  }

  const postAttachments: Slide[] = []
  if (props.data.reshared_from) {
    postAttachments.push({
      title: 'Reshared Post',
      icon: <ShareIcon />,
      el: <ResharedPost
        key={'reshared-post'}
        resharedFrom={props.data.reshared_from}
        showDetail={props.detail}
        me={props.me}
      />
    })
    if (props.data.link_previews.length > 0) {
      postAttachments.push({
        title: 'Link Previews',
        icon: <LinkIcon />,
        el: <LinkPreviews
          key={'reshared-post-previews'}
          post={props.data}
        />})
    }
  } else {
    if (mediaUrls.length > 0) {
      postAttachments.push({
        title: 'Media',
        icon: <PhotographIcon />,
        el: <MediaCollage
          key={'post-media'}
          mediaUrls={mediaUrls}
        />})
    }
    if (props.data.poll.choices && props.data.poll.choices.length > 0) {
      postAttachments.push({
        title: 'Poll',
        icon: <ChartSquareBarIcon />,
        el: <Poll
          key={'post-poll'}
          poll={props.data.poll}
          postId={props.data.id}
          me={props.me}
        />
      })
    }
    if (props.data.link_previews.length > 0) {
      postAttachments.push({
        title: 'Link Previews',
        icon: <LinkIcon />,
        el: <LinkPreviews
          key={'post-link-previews'}
          post={props.data}
        />
      })
    }
  }

  return (
    <div className="post-wrapper">
      <div className="post-op">
        <div className="post-op-info-wrapper">
          <div className="post-op-info-left">
            <div className="post-avatar">
              <RoundAvatar user={!blocked ? props.data.author : null}/>
            </div>
            <div className="post-name">
              <ClickableId user={!blocked ? props.data.author : null}/>
            </div>
            <div className="post-visibility">
              &#x25B8; {sharingScope}
            </div>
          </div>
          <div>
            <div className="post-op-info-time" onClick={navigateToPostPage} style={{
              cursor: disableNavigateToPostPage ? 'auto' : 'pointer'
            }}>
              {pastTime(props.data.created_at_seconds)}
            </div>
            {
              props.me.id === props.data.author.id && !deleted && !deleting &&
              <PillDropdownMenu
                items={
                  mediaUrls.length > 0 && props.data.content ? [
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
                !props.data.is_update_avatar ?
                  parseContentWithLinkPreviews(props.data.content, props.data.link_previews,`post-content ${props.detail ? '' : 'post-content-summary'}`)
                  :
                  <div className='post-content' style={{fontStyle: 'italic'}}>@{props.data.author.id} has a new
                    avatar!</div> :
                <div className='post-content' style={{fontStyle: 'italic'}}>This user has been blocked</div>
              :
              <div className='post-content' style={{fontStyle: 'italic'}}>This post has been deleted</div>
          }
        </div>
        {!deleting && !deleted && !blocked &&
          <div className='post-attachments-wrapper'>
            <PillSlide slides={postAttachments}/>
          </div>
        }
        {!deleting && !deleted && !blocked &&
          <div className="post-interactions-wrapper">
            <Reactions
              reactions={props.data.reactions}
              me={props.me}
              postId={props.data.id}
            />
            <div className="post-interactions">
              <div className="post-circle-button" onClick={commentButtonOnClick}>
                <ChatIcon />
              </div>
              {props.data.reshareable ?
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
          post={props.data}
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


