import RoundAvatar from "../RoundAvatar/RoundAvatar";
import React, {useState} from "react";
import User from "../../models/User";
import {useHotkeys} from "react-hotkeys-hook";
import ApiError from "../../api/ApiError";
import Post, {Comment, NestedComment} from "../../models/Post";
import {useToast} from "../Toast/ToastProvider";
import summary from "../../utils/summary";
import ContentTextarea from "../ContentTextarea/ContentTextarea";
import api from "../../api/Api";
import {PhotographIcon} from "@heroicons/react/solid";
import AddMedia from "../AddMedia/AddMedia";
import PillModal from "../PillModal/PillModal";
import Media from "../../models/Media";
import convertHeicFileToPng from "../../utils/convertHeicFileToPng";
import './NewComment.css'
import EditingMediaCollage from "../EditingMediaCollage/EditingMediaCollage";

interface Props {
  me: User,
  post: Post,
  content: string
  updateContent: (newContent: string) => void
  replyingToComment: Comment | null
  replyingToNestedComment: NestedComment | null
  addComment: (comment: Comment) => void
  addNestedComment: (nestedComment: NestedComment) => void
  afterSendingComment: () => void
}

const NewComment = (props: Props) => {
  const {content, updateContent} = props
  const [posting, updatePosting] = useState(false)
  const [mediaFiles, updateMediaFiles] = useState<File[]>([])
  const [ownedMedias, updateOwnedMedias] = useState<Media[]>([])
  const [mediaOpened, updateMediaOpened] = useState(false)

  const { addToast } = useToast()

  const onChangeMedias = async (fl: FileList) => {
    if (posting) {
      return
    }
    if (mediaFiles.length >= 1) {
      addToast(`Only allowed to upload 1 image`);
      return
    }
    let uploadedMedias: File[] = []
    for (let i = 0; i < fl.length; i++) {
      const f = fl[i]
      const heic = f.name.toLowerCase().endsWith(".heic")
      if (heic) {
        addToast("Converting heic image, please wait a while before image shows up...", true)
      }
      uploadedMedias.push(heic ? await convertHeicFileToPng(f) : f)
    }
    updateMediaFiles(mediaFiles.concat(uploadedMedias))
  }

  const isContentValid = () => {
    return content.trim().length > 0 || mediaFiles.length > 0 || ownedMedias.length > 0
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

    if (props.replyingToComment) {
      // reply nested comment
      try {
        const newNestedComment = await api.createNestedComment(
          content,
          props.post.id,
          props.replyingToComment.id,
          mediaFiles,
          ownedMedias.map(_ => _.object_name),
          props.replyingToNestedComment && props.replyingToNestedComment.id
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
        const newComment = await api.createComment(
          content,
          props.post.id,
          mediaFiles,
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
    updateMediaFiles([])
    updateOwnedMedias([])
    props.afterSendingComment()
  }

  let contentPlaceholder
  if (props.replyingToNestedComment) {
    contentPlaceholder = `Replying to "${summary(props.replyingToNestedComment.content, 20)}"`
  } else if (props.replyingToComment) {
    contentPlaceholder = `Replying to "${summary(props.replyingToComment.content, 20)}"`
  } else {
    contentPlaceholder = `Replying to "${summary(props.post.content, 20)}"`
  }

  return (
    <div className="post-new-comment-wrapper fade-in">
      <div className="post-new-comment-input-area">
        <div className="post-new-comment-avatar">
          <RoundAvatar user={props.me}/>
        </div>
        <ContentTextarea
          content={content}
          onChange={(newContent) => {
            updateContent(newContent)
          }}
          onAddMedia={onChangeMedias}
          disabled={false}
          textAreaClassName='post-new-comment-input'
          placeholder={contentPlaceholder}
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
        (mediaFiles.length + ownedMedias.length) > 0 &&
          <EditingMediaCollage
            mediaUrls={mediaFiles.map(URL.createObjectURL).concat(ownedMedias.map(_ => _.media_url))}
          />
      }
      <div className="post-new-comment-buttons">
        <PhotographIcon
          className='post-new-comment-attachment-icon'
          onClick={() => {
            if (!posting) {
              updateMediaOpened(true)
            }
          }}
        />
        <div
          className={
            isContentValid() && !posting ?
              "post-new-comment-post-button" :
              "post-new-comment-post-button post-new-comment-post-button-invalid"
          }
          onClick={sendComment}
        >Comment</div>
      </div>
    </div>
  )
}

export default NewComment
