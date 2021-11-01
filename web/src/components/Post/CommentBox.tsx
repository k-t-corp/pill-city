import RoundAvatar from "../RoundAvatar/RoundAvatar";
import MediaPreview from "../MediaPreview/MediaPreview";
import React, {useState} from "react";
import User from "../../models/User";
import {useHotkeys} from "react-hotkeys-hook";
import FormData from "form-data";
import parseMentioned from "../../utils/parseMentioned";
import ApiError from "../../api/ApiError";
import Post, {Comment, NestedComment} from "../../models/Post";
import {useToast} from "../Toast/ToastProvider";
import './CommentBox.css'

interface Props {
  api: any
  me: User,
  post: Post,
  content: string
  updateContent: (newContent: string) => void
  replyNestedCommentId?: string
  addComment: (comment: Comment) => void
  addNestedComment: (nestedComment: NestedComment) => void
  afterSendingComment: () => void
}

export default (props: Props) => {
  const { content, updateContent } = props
  const [ posting, updatePosting ] = useState(false)
  const [ media, updateMedia ] = useState<any[]>([])

  const { addToast } = useToast()

  const onAddMedia = (e: any) => {
    if (posting) {
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
        updateMedia(selectedMedias)
      }
    }
  }

  const isContentValid = () => {
    return content.trim().length > 0 || media.length > 0
  }

  useHotkeys('ctrl+enter', () => {
    (async () => {
      if (content.endsWith('\n')) {
        // if sent using ctrl+enter, there should be an extra newline at the end
        updateContent(content.substring(0, content.length - 1))
      }
      if (isContentValid()) {
        await sendComment()
      }}
    )()
  }, {
    enableOnTags: ['TEXTAREA']
  })

  const sendComment = async () => {
    updatePosting(true)

    // upload media
    let mediaData = new FormData()
    for (let i = 0; i < media.length; i++) {
      const blob = new Blob([media[i]], {type: 'image/*'})
      mediaData.append(`media${i}`, blob)
    }

    if (props.replyNestedCommentId) {
      // reply nested comment
      try {
        const newNestedComment = await props.api.postNestedComment(
          content,
          props.post.id,
          props.replyNestedCommentId,
          parseMentioned(content),
          mediaData
        )
        props.addNestedComment(newNestedComment)
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
          content,
          props.post.id,
          parseMentioned(content),
          mediaData
        )
        props.addComment(newComment)
      } catch (e) {
        if (e instanceof ApiError) {
          addToast(e.message)
        } else {
          addToast('Unknown error')
        }
      }
    }
    updatePosting(false)
    updateContent('')
    updateMedia([])
    props.afterSendingComment()
  }

  return (
    <div className="post-comment-box-wrapper fade-in">
      <div className="post-comment-box-input-area">
        <div className="post-comment-box-avatar">
          <RoundAvatar user={props.me}/>
        </div>
        <textarea
          id="post-comment-box-input"
          placeholder="Add comment"
          value={content}
          onChange={e => {
            e.preventDefault()
            updateContent(e.target.value)
          }}
        />
        <label className="post-comment-box-attachment-button">
          <input
            accept="image/*"
            type="file"
            onChange={onAddMedia}
            multiple={false}
            disabled={posting}
          />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"/>
          </svg>
        </label>
      </div>
      {
        media.length > 0 &&
          <MediaPreview
            mediaUrls={[URL.createObjectURL(media[0])]}
            oneRowHeight='300px'
            twoRowHeight=''
            threeRowHeight=''
          />
      }
      <div className="post-comment-box-buttons">
        <div
          className={
            isContentValid() && !posting ?
              "post-comment-box-post-button" :
              "post-comment-box-post-button post-comment-box-post-button-invalid"
          }
          onClick={sendComment}
        >Comment</div>
      </div>
    </div>
  )
}
