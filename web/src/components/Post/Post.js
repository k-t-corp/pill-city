import React, {useEffect, useRef, useState} from 'react'
import _ from 'lodash'
import "./Post.css"
import parseContent from "../../utils/parseContent";
import timePosted from "../../utils/timePosted";
import MediaPreview from "../MediaPreview/MediaPreview";
import DropdownMenu from "../DropdownMenu/DropdownMenu"
import parseMentioned from "../../utils/parseMentioned";
import {useHotkeys} from "react-hotkeys-hook";
import {useMediaQuery} from "react-responsive";
import {useHistory} from "react-router-dom";
import FormData from "form-data";
import RoundAvatar from "../RoundAvatar/RoundAvatar";
import LinkPreview from "../LinkPreview/LinkPreview";
import Reactions from "./Reactions";
import ResharedPost from "./ResharedPost";
import ClickableId from "../ClickableId/ClickableId";
import ApiError from "../../api/ApiError";
import {useToast} from "../Toast/ToastProvider";
import NestedComment from "./NestedComment";

export default (props) => {
  const [deleted, updateDeleted] = useState(props.data.deleted)
  const [deleting, updateDeleting] = useState(false)

  // existing comment data cached in state
  const [comments, updateComments] = useState(
    _.cloneDeep(props.data.comments).map(c => {
      return {
        ...c,
        deleting: false,
        comments: c.comments.map(cc => {
          return {
            ...cc,
            deleting: false
          }
        })
      }
    })
  )
  // whether the comment box is expanded
  const [addingComment, updateAddingComment] = useState(false)
  // comment box content
  const [commentContent, updateCommentContent] = useState('')
  // comment media
  const [commentMedia, updateCommentMedia] = useState([])
  // currently replying to comment ID
  const [replyNestedCommentId, updateReplyNestedCommentId] = useState("")
  // is loading after a comment is posted
  const [afterCommentLoading, updateAfterCommentLoading] = useState(false)

  const [mediaUrls, updateMediaUrls] = useState(props.data.media_urls)

  const isTabletOrMobile = useMediaQuery({query: '(max-width: 750px)'})
  const { addToast } = useToast()
  const history = useHistory()

  const highlightCommentId = props.highlightCommentId
  const isHighlightComment = (commentId) => {
    return highlightCommentId === commentId
  }
  const highlightCommentRef = useRef(null)
  useEffect(() => {
    if (highlightCommentId) {
      highlightCommentRef.current.scrollIntoView({behavior: 'smooth'})
    }
  }, [highlightCommentRef])

  let commentElements = []
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i]

    let nestedCommentElements = []
    for (let i = 0; i < comment.comments.length; i++) {
      const nestedComment = comment.comments[i]

      nestedCommentElements.push(
        <NestedComment
          key={i}
          api={props.api}
          me={props.me}
          nestedComment={nestedComment}
          parentComment={comment}
          isHighlightComment={isHighlightComment(nestedComment.id)}
          highlightCommentRef={highlightCommentRef}
          onReply={() => {
            updateAddingComment(true)
            updateReplyNestedCommentId(comment.id)
            updateCommentContent(`@${nestedComment.author.id} `)
          }}
        />
      )
    }

    const replyCommentButtonOnclick = () => {
      if (comment.deleting) {
        return
      }
      updateAddingComment(true)
      updateReplyNestedCommentId(comment.id)
    }

    const deleteCommentButtonOnclick = async () => {
      if (comment.deleting) {
        return
      }
      if (!window.confirm('Are you sure you want to delete this comment?')) {
        return
      }
      // mark as deleting
      updateComments(comments.map(c => {
        if (comment.id === c.id) {
          return {
            ...c,
            deleting: true
          }
        }
        return {...c}
      }))
      await props.api.deleteComment(props.data.id, comment.id)
      // marked as deleted and not deleting
      updateComments(comments.map(c => {
        if (comment.id === c.id) {
          return {
            ...c,
            deleted: true,
            deleting: false
          }
        }
        return {...c}
      }))
    }

    commentElements.push(
      <div
        id={comment.id}
        ref={isHighlightComment(comment.id) ? highlightCommentRef : null}
        key={i}
        className={`post-comment ${isHighlightComment(comment.id) ? "highlight-comment" : ""}`}
      >
        <div className="post-avatar post-comment-avatar">
          <RoundAvatar user={!comment.deleted ? comment.author : null}/>
        </div>
        <div className="post-comment-main-content">
          <div className="post-comment-info">
            <div className="post-name post-comment-name">
              <ClickableId user={!comment.deleted ? comment.author : null}/>
            </div>
            <div className="post-time">
              {timePosted(comment.created_at_seconds)}
            </div>
          </div>
          <div className={`post-content comment-content ${props.detail ? '' : 'post-content-summary'}`}>
            {
              !comment.deleted ?
                parseContent(comment.content, "") :
                <div style={{fontStyle: 'italic'}}>This comment has been deleted</div>
            }
            {
              !comment.deleted && comment.media_urls.length > 0 &&
              <div>
                <MediaPreview
                  mediaUrls={[comment.media_urls[0]]}
                  oneRowHeight='200px'
                  twoRowHeight=''
                  threeRowHeight=''
                  forCommentPreview={true}
                />
              </div>
            }
            {
              !comment.deleting && !comment.deleted &&
              <span className="post-comment-reply-btn" onClick={replyCommentButtonOnclick}>
                  Reply
                </span>
            }
            {
              !comment.deleting && !comment.deleted && comment.author.id === props.me.id &&
              <span className="post-comment-delete-btn" onClick={deleteCommentButtonOnclick}>
                  Delete
                </span>
            }
          </div>
          <div className="post-nested-comment-wrapper">
            {nestedCommentElements}
          </div>
        </div>
      </div>
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

  const commentButtonOnClick = () => {
    updateAddingComment(!addingComment)
  }

  const isCommentValid = () => {
    return commentContent.trim().length > 0 || commentMedia.length > 0
  }

  // TODO: there is a subtle bug (feature?) that if multiple comment boxes are expanded and filled, multiple comments will be sent
  useHotkeys('ctrl+enter', async () => {
    console.log('Post ctrl+enter')
    if (commentContent.endsWith('\n')) {
      // if sent using ctrl+enter, there should be an extra newline at the end
      updateCommentContent(commentContent.substring(0, commentContent.length - 1))
    }
    if (isCommentValid()) {
      await postCommentButtonOnClick()
    }
  }, {
    enableOnTags: ['TEXTAREA']
  })

  const postCommentButtonOnClick = async () => {
    updateAfterCommentLoading(true)

    // upload media
    let mediaData = new FormData()
    for (let i = 0; i < commentMedia.length; i++) {
      const blob = new Blob([commentMedia[i]], {type: 'image/*'})
      mediaData.append(`media${i}`, blob, blob.name)
    }

    if (replyNestedCommentId !== "") {
      // reply nested comment
      try {
        const newNestedComment = await props.api.postNestedComment(
          commentContent,
          props.data.id,
          replyNestedCommentId,
          parseMentioned(commentContent),
          mediaData
        )
        updateComments(comments.map(c => {
          if (c.id !== replyNestedCommentId) {
            return c
          }
          return {
            ...c,
            comments: [...c.comments, newNestedComment]
          }
        }))
      } catch (e) {
        if (e instanceof ApiError) {
          addToast(e.message)
        } else {
          addToast('Unknown error')
        }
      }
    } else {
      try {
        const newComment = await props.api.postComment(
          commentContent,
          props.data.id,
          parseMentioned(commentContent),
          mediaData
        )
        updateComments([...comments, newComment])
      } catch (e) {
        if (e instanceof ApiError) {
          addToast(e.message)
        } else {
          addToast('Unknown error')
        }
      }
    }
    updateAfterCommentLoading(false)
    updateAddingComment(false)
    updateCommentContent('')
    updateReplyNestedCommentId("")
    updateCommentMedia([])
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

  const onCommentMediaOnClick = (e) => {
    if (afterCommentLoading) {
      return
    }
    if (e.target.files && e.target.files[0]) {
      if (e.target.files.length > 1) {
        alert(`Only allowed to upload 1 image`);
      } else {
        let selectedMedias = []
        for (let i = 0; i < e.target.files.length; i++) {
          selectedMedias.push(e.target.files[i])
        }
        updateCommentMedia(selectedMedias)
      }
    }
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
        {addingComment ?
          <div className="post-comment-box-wrapper fade-in">
            <div className="post-comment-box-input-area">
              <div className="post-avatar post-comment-avatar">
                <RoundAvatar user={props.me}/>
              </div>
              <textarea
                id="post-comment-box-input"
                placeholder="Add comment"
                value={commentContent}
                onChange={e => {
                  e.preventDefault()
                  updateCommentContent(e.target.value)
                }}
              />
              <label className="new-comment-attachment-button">
                <input
                  accept="image/*"
                  type="file"
                  onChange={onCommentMediaOnClick}
                  multiple={false}
                  disabled={afterCommentLoading}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"/>
                </svg>
              </label>
            </div>
            {
              commentMedia.length > 0 &&
              <MediaPreview
                mediaUrls={[URL.createObjectURL(commentMedia[0])]}
                oneRowHeight='300px'
                twoRowHeight=''
                threeRowHeight=''
              />
            }
            <div className="post-comment-box-buttons">
              <div
                className={
                  isCommentValid() && !afterCommentLoading ?
                    "post-comment-box-post-button" :
                    "post-comment-box-post-button post-comment-box-post-button-invalid"
                }
                onClick={postCommentButtonOnClick}
              >Comment
              </div>
            </div>
          </div> : null}
      </div>
      {comments.length === 0 ? null :
        <div className="post-comments-wrapper">
          {commentElements}
        </div>
      }
    </div>
  )
}


