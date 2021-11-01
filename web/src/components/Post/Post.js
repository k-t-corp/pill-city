import React, {useEffect, useRef, useState} from 'react'
import parseContent from "../../utils/parseContent";
import timePosted from "../../utils/timePosted";
import MediaPreview from "../MediaPreview/MediaPreview";
import DropdownMenu from "../DropdownMenu/DropdownMenu"
import {useMediaQuery} from "react-responsive";
import {useHistory} from "react-router-dom";
import RoundAvatar from "../RoundAvatar/RoundAvatar";
import LinkPreview from "../LinkPreview/LinkPreview";
import Reactions from "./Reactions";
import ResharedPost from "./ResharedPost";
import ClickableId from "../ClickableId/ClickableId";
import Comment from "./Comment";
import CommentBox from "./CommentBox";
import "./Post.css"

export default (props) => {
  const [deleted, updateDeleted] = useState(props.data.deleted)
  const [deleting, updateDeleting] = useState(false)
  const [ commentContent, updateCommentContent ] = useState('')

  // existing comment data cached in state
  const [comments, updateComments] = useState(props.data.comments)
  // whether the comment box is expanded
  const [addingComment, updateAddingComment] = useState(false)
  // currently replying to comment
  const [replyingToComment, updateReplyingToComment] = useState(null)

  const [mediaUrls, updateMediaUrls] = useState(props.data.media_urls)

  const isTabletOrMobile = useMediaQuery({query: '(max-width: 750px)'})
  const history = useHistory()

  const highlightCommentId = props.highlightCommentId
  const highlightCommentRef = useRef(null)
  useEffect(() => {
    if (highlightCommentId) {
      highlightCommentRef.current.scrollIntoView({behavior: 'smooth'})
    }
  }, [highlightCommentRef])

  let commentElems = []
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i]

    commentElems.push(
      <Comment
        api={props.api}
        me={props.me}
        comment={comment}
        post={props.data}
        detail={props.detail}
        highlightCommentId={highlightCommentId}
        highlightCommentRef={highlightCommentRef}
        onReply={() => {
          updateAddingComment(true)
          updateReplyingToComment(comment)
        }}
        onNestedCommentReply={(nestedComment) => {
          updateAddingComment(true)
          updateReplyingToComment(comment)
          updateCommentContent(`@${nestedComment.author.id} `)
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
    await props.api.deletePost(props.data.id)
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
    await props.api.deletePostMedia(props.data.id)
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
    sharingScope = props.data.circles.filter(_ => _).map(c => c.name).join(', ')
  } else {
    sharingScope = 'Only you'
  }

  const disableNavigateToPostPage = props.disableNavigateToPostPage === true
  const navigateToPostPage = e => {
    e.preventDefault();
    if (!disableNavigateToPostPage) {
      history.push(`/post/${props.data.id}`)
    }
  }

  const commentButtonOnClick = () => {
    updateAddingComment(!addingComment)
    updateReplyingToComment(null)
  }

  return (
    <div className="post-wrapper">
      <div className="post-op">
        <div className="post-op-info-wrapper">
          <div className="post-op-info-left">
            <div className="post-avatar">
              <RoundAvatar user={props.data.author}/>
            </div>
            <div className="post-name">
              <ClickableId user={props.data.author}/>
            </div>
            <div className="post-visibility">
              &#x25B8; {sharingScope}
            </div>
          </div>
          <div className="post-op-info-right">
            {
              props.me.id === props.data.author.id && !deleted &&
              <DropdownMenu
                items={
                  mediaUrls.length > 0 && props.data.content ? [
                    {
                      text: 'Delete all media',
                      callback: deletePostMedia
                    },
                    {
                      text: 'Delete post',
                      callback: deletePost
                    }
                  ] : [
                    {
                      text: 'Delete post',
                      callback: deletePost
                    }
                  ]
                }
              >
                <div className="post-more-actions-trigger">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
                  </svg>
                </div>
              </DropdownMenu>
            }
            <div className="post-op-info-time" onClick={navigateToPostPage} style={{
              cursor: disableNavigateToPostPage ? 'auto' : 'pointer'
            }}>
              {timePosted(props.data.created_at_seconds)}
            </div>
          </div>
        </div>
        <div className='post-content-wrapper'>
          {
            !deleted ?
              !props.data.is_update_avatar ?
                parseContent(props.data.content, `post-content ${props.detail ? '' : 'post-content-summary'}`)
                :
                <div className='post-content' style={{fontStyle: 'italic'}}>@{props.data.author.id} has a new
                  avatar!</div>
              :
              <div className='post-content' style={{fontStyle: 'italic'}}>This post has been deleted</div>
          }
        </div>
        {props.data.reshared_from &&
        <ResharedPost
          resharedFrom={props.data.reshared_from}
          showDetail={props.detail}
          api={props.api}
        />
        }
        {!deleted &&
        <MediaPreview
          mediaUrls={mediaUrls}
          threeRowHeight="130px"
          twoRowHeight="150px"
          oneRowHeight={isTabletOrMobile ? "200px" : "280px"}
        />
        }
        {
          !deleted &&
          <LinkPreview post={props.data} api={props.api}/>
        }
        {
          !deleting && !deleted &&
          <div className="post-interactions-wrapper">
            <div className="post-reactions-wrapper">
              <Reactions
                reactions={props.data.reactions}
                api={props.api}
                me={props.me}
                postId={props.data.id}
              />
            </div>
            <div className="post-interactions">
              <div className="post-circle-button" onClick={commentButtonOnClick}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"/>
                </svg>
              </div>

              {props.data.reshareable ?
                <div className="post-circle-button" onClick={reshareButtonOnClick}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                  </svg>
                </div>
                :
                <div className="post-circle-button">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd"
                          d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                          clipRule="evenodd"/>
                  </svg>
                </div>
              }
            </div>
          </div>
        }
        {addingComment && <CommentBox
          api={props.api}
          me={props.me}
          post={props.data}
          content={commentContent}
          updateContent={updateCommentContent}
          replyingToComment={replyingToComment}
          addComment={(newComment) => {
            updateComments([...comments, newComment])
          }}
          addNestedComment={(newNestedComment) => {
            updateComments(comments.map(c => {
              if (c.id !== replyingToComment.id) {
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


