import RoundAvatar from "../RoundAvatar/RoundAvatar";
import MediaPane from "../MediaPane/MediaPane";
import React, {useState} from "react";
import User from "../../models/User";
import {useHotkeys} from "react-hotkeys-hook";
import FormData from "form-data";
import parseMentioned from "../../utils/parseMentioned";
import ApiError from "../../api/ApiError";
import Post, {Comment, NestedComment} from "../../models/Post";
import {useToast} from "../Toast/ToastProvider";
import summary from "../../utils/summary";
import ContentTextarea from "../ContentTextarea/ContentTextarea";
import api from "../../api/Api";
import './CommentBox.css'
import {PhotographIcon} from "@heroicons/react/solid";
import AddMedia from "../AddMedia/AddMedia";
import PillModal from "../PillModal/PillModal";
import Media from "../../models/Media";
import convertHeicFileToPng from "../../utils/convertHeicFileToPng";

interface Props {
  me: User,
  post: Post,
  content: string
  updateContent: (newContent: string) => void
  replyingToComment: Comment | null
  addComment: (comment: Comment) => void
  addNestedComment: (nestedComment: NestedComment) => void
  afterSendingComment: () => void
}

export default (props: Props) => {
  const {content, updateContent} = props
  const [posting, updatePosting] = useState(false)
  const [medias, updateMedias] = useState<File[]>([])
  const [ownedMedias, updateOwnedMedias] = useState<Media[]>([])
  const [mediaOpened, updateMediaOpened] = useState(false)

  const { addToast } = useToast()

  const onChangeMedias = async (fl: FileList) => {
    if (posting) {
      return
    }
    if (fl && fl[0]) {
      if (fl.length> 1) {
        alert(`Only allowed to upload 1 image`);
      } else {
        let uploadedMedias: File[] = []
        for (let i = 0; i < fl.length; i++) {
          const f = fl[i]
          const heic = f.name.endsWith(".heic")
          if (heic) {
            addToast("Converting heic image, please wait a while before image shows up...", true)
          }
          uploadedMedias.push(heic ? await convertHeicFileToPng(f) : f)
        }
        updateMedias(medias.concat(uploadedMedias))
      }
    }
  }

  const isContentValid = () => {
    return content.trim().length > 0 || medias.length > 0 || ownedMedias.length > 0
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
    for (let i = 0; i < medias.length; i++) {
      const blob = new Blob([medias[i]], {type: 'image/*'})
      mediaData.append(`media${i}`, blob)
    }

    if (props.replyingToComment) {
      // reply nested comment
      try {
        const newNestedComment = await api.postNestedComment(
          content,
          props.post.id,
          props.replyingToComment.id,
          parseMentioned(content),
          mediaData,
          ownedMedias.map(_ => _.object_name)
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
        const newComment = await api.postComment(
          content,
          props.post.id,
          parseMentioned(content),
          mediaData,
          ownedMedias.map(_ => _.object_name)
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
    updateMedias([])
    updateOwnedMedias([])
    props.afterSendingComment()
  }

  let contentPlaceholder
  if (props.replyingToComment) {
    contentPlaceholder = `Replying to "${summary(props.replyingToComment.content, 10)}"`
  } else {
    contentPlaceholder = `Replying to "${summary(props.post.content, 20)}"`
  }

  return (
    <div className="post-comment-box-wrapper fade-in">
      <div className="post-comment-box-input-area">
        <div className="post-comment-box-avatar">
          <RoundAvatar user={props.me}/>
        </div>
        <ContentTextarea
          content={content}
          onChange={(newContent) => {
            updateContent(newContent)
          }}
          disabled={false}
          textAreaClassName='post-comment-box-input'
          placeholder={contentPlaceholder}
        />
        <PhotographIcon
          className='post-comment-box-attachment-button'
          onClick={() => {
            if (!posting) {
              updateMediaOpened(true)
            }
          }}
        />
        <PillModal
          isOpen={mediaOpened}
          onClose={() => {updateMediaOpened(false)}}
          title="Add media"
        >
          <AddMedia
            onChangeMedias={onChangeMedias}
            onSelectOwnedMedia={m => {
              updateOwnedMedias([m])
            }}
            onClose={() => {updateMediaOpened(false)}}
          />
        </PillModal>
      </div>
      {
        (medias.length + ownedMedias.length) > 0 &&
          <MediaPane mediaUrls={medias.map(URL.createObjectURL).concat(ownedMedias.map(_ => _.media_url))}/>
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
