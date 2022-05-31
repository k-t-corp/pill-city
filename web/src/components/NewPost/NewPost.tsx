import React, {useEffect, useState} from 'react'
import {useHotkeys} from "react-hotkeys-hook";
import parseContent from "../../utils/parseContent";
import MediaPane from "../MediaPane/MediaPane";
import parseMentioned from "../../utils/parseMentioned";
import RoundAvatar from "../RoundAvatar/RoundAvatar";
import ClickableId from "../ClickableId/ClickableId";
import Circle from "../../models/Circle";
import Post, {ResharedPost} from "../../models/Post";
import {useToast} from "../Toast/ToastProvider";
import ApiError from "../../api/ApiError";
import ContentTextarea from "../ContentTextarea/ContentTextarea";
import {useAppSelector} from "../../store/hooks";
import {ChartSquareBarIcon, PhotographIcon} from "@heroicons/react/solid";
import PillModal from "../PillModal/PillModal";
import AddMedia from "../AddMedia/AddMedia";
import api from "../../api/Api";
import "./NewPost.css"
import Media from "../../models/Media";
import {arrayMoveImmutable} from "array-move";
import AddPoll from "../AddPoll/AddPoll";
import {QuestionMarkCircleIcon} from "@heroicons/react/outline";
import PillCheckbox from "../PillCheckbox/PillCheckbox";
import Select, {OnChangeValue} from "react-select";

interface Props {
  beforePosting: () => void
  afterPosting: (post: Post) => void
  resharePostData: Post | ResharedPost | null
  updateResharePostData: (post: Post | null) => void
}

type CircleIdOrPublic = string | boolean
interface SharingScopeOption {
  value: CircleIdOrPublic
  label: string
}
const SharingScopePublicOption = {label: '🌏 Public', value: true}

interface NewPostMediaUploaded {
  type: 'Uploaded'
  media: File
}

interface NewPostMediaOwned {
  type: 'Owned'
  media: Media
}
export interface AddPollChoice {
  text: string
}

export default (props: Props) => {
  const me = useAppSelector(state => state.me.me)
  const [myCircles, updateMyCircles] = useState<Circle[]>([])

  const [content, updateContent] = useState<string>("")
  const [sharingScope, updateSharingScope] = useState<SharingScopeOption[]>([])
  const [resharable, updateResharable] = useState(true)
  const [medias, updateMedias] = useState<(NewPostMediaUploaded | NewPostMediaOwned)[]>([])
  const [pollChoices, updatePollChoices] = useState<AddPollChoice[]>([])
  const [addingMedia, updateAddingMedia] = useState(false)
  const [addingPoll, updateAddingPoll] = useState(false)
  const [posting, updatePosting] = useState(false)

  const [sharingScopeExplanationOpened, updateSharingScopeExplanationOpened] = useState(false)
  const [enableResharingExplanationOpened, updateEnableResharingExplanationOpened] = useState(false)
  const [reshareExplanationOpened, updateReshareExplanationOpened] = useState(false)

  const {addToast, removeToast} = useToast()

  useEffect(() => {
    (async () => {
      updateMyCircles(await api.getCircles())
    })()
  }, [])

  useHotkeys('ctrl+enter', () => {
    (async () => {
      if (content.endsWith('\n')) {
        // if sent using ctrl+enter, there should be an extra newline at the end
        updateContent(content.substring(0, content.length - 1))
      }
      if (isValid()) {
        await postButtonOnClick()
      }
    })()
  }, {
    enableOnTags: ['TEXTAREA']
  })

  const isValid = () => {
    return (content.trim().length !== 0 || medias.length !== 0) && sharingScope.length !== 0
  }

  const reset = () => {
    updateContent('')
    updateSharingScope([])
    updateResharable(true)
    updateMedias([])
    updatePollChoices([])
  }

  const postButtonOnClick = async () => {
    if (!isValid() || posting) {
      return
    }
    updatePosting(true)
    if (pollChoices.length > 0) {
      if (!confirm("Are you sure to send a post with poll? Even if you delete the post, you won't be able to delete the poll results.")) {
        return
      }
    }

    // parse post parameters
    const actualCircleIds = sharingScope.filter(cn => cn.value !== true).map(_ => _.value)
    const isPublic = sharingScope.filter(cn => cn.value === true).length !== 0
    console.log(actualCircleIds, isPublic)

    // before sending post
    const toastId = addToast('Sending new post', false)
    props.beforePosting()

    // send post
    let post: Post | null = null
    try {
      post = await api.postPost(
        content,
        isPublic,
        actualCircleIds,
        props.resharePostData === null ? resharable : true,
        props.resharePostData === null ? null : props.resharePostData.id,
        props.resharePostData === null ? medias : [],
        parseMentioned(content),
        pollChoices
      );
    } catch (e) {
      if (e instanceof ApiError) {
        addToast(e.message)
      } else {
        addToast('Unknown error')
      }
    }

    // after sending post
    reset()
    removeToast(toastId)
    if (post) {
      props.afterPosting(post)
      addToast('New post sent')
    }

    updatePosting(false)
  }

  const onChangeMedias = (fl: FileList) => {
    if (posting) {
      return
    }
    if (fl && fl[0]) {
      if (fl.length > 4) {
        alert(`Only allowed to upload 4 images`);
      } else {
        let selectedMedias = []
        for (let i = 0; i < fl.length; i++) {
          selectedMedias.push(fl[i])
        }
        updateMedias(medias.concat(selectedMedias.map(sm => {
          return {
            type: 'Uploaded',
            media: sm
          }
        })))
      }
    }
  }

  const sharingScopeOnChange = (options: OnChangeValue<SharingScopeOption, true>) => {
    if (posting) {
      return
    }
    // todo: why as?
    updateSharingScope(options as SharingScopeOption[])
  }

  const resharableOnChange = (checked: boolean) => {
    if (posting) {
      return
    }
    updateResharable(checked)
  }

  const sharingScopeSelections: {label: string, value: CircleIdOrPublic}[] = [SharingScopePublicOption, ...myCircles.map(circle => {
    const {name, id} = circle
    return {label: `⭕ ${name}`, value: id}
  })]

  return (
    <div className="new-post">
      <div className="new-post-user-info">
        <div className="new-post-avatar">
          <RoundAvatar user={me}/>
        </div>
        <div className="new-post-name">
          <ClickableId user={me}/>
        </div>
      </div>
      {props.resharePostData !== null &&
        <div className="new-post-reshare-preview">
          <div className="new-post-reshared-info-wrapper">
            <div className="new-post-reshared-info">
              <div className="post-avatar post-reshared-avatar">
                <RoundAvatar user={props.resharePostData.author}/>
              </div>
              <div className="post-reshared-author">
                <ClickableId user={props.resharePostData.author}/>
              </div>
            </div>
            <div className="new-post-reshare-delete" onClick={() => props.updateResharePostData(null)}>
              &times;
            </div>
          </div>
          <div className="post-content new-post-reshare-content-summary">
            {parseContent(props.resharePostData.content, "")}
          </div>
        </div>
      }
      {props.resharePostData === null &&
        <>
          <MediaPane
            mediaUrls={medias.map(m => {
              if (m.type === 'Uploaded') {
                return URL.createObjectURL(m.media)
              } else {
                return m.media.media_url
              }
            })}
            mediaOperations={[
              {
                op: '<',
                action: i => {
                  if (i === 0) {
                    return
                  }
                  updateMedias(arrayMoveImmutable(medias, i - 1, i))
                }
              },
              {
                op: 'x',
                action: i => {
                  updateMedias(medias.filter((_, ii) => i !== ii))
                }
              },
              {
                op: '>',
                action: i => {
                  if (i === medias.length - 1) {
                    return
                  }
                  updateMedias(arrayMoveImmutable(medias, i, i + 1))
                }
              },
            ]}
          />
        </>
      }
      <div className="new-post-text-box-container">
        {props.resharePostData === null &&
          <>
            <PhotographIcon
              className='new-post-media-button'
              style={{color: medias.length > 0 ? 'black' : '#b2b2b2'}}
              onClick={() => {
                if (!posting) {
                  updateAddingMedia(true)
                }
              }}
            />
            <ChartSquareBarIcon
              className='new-post-poll-button'
              style={{color: pollChoices.length > 0 ? 'black' : '#b2b2b2'}}
              onClick={() => {
                if (!posting) {
                  updateAddingPoll(true)
                }
              }}
            />
            <PillModal
              isOpen={addingMedia}
              onClose={() => {updateAddingMedia(false)}}
              title="Add media"
            >
              <AddMedia
                onChangeMedias={onChangeMedias}
                onSelectOwnedMedia={m => {
                  updateMedias(medias.concat([{
                    type: 'Owned',
                    media: m
                  }]))
                }}
                onClose={() => {updateAddingMedia(false)}}
              />
            </PillModal>
            <PillModal
              isOpen={addingPoll}
              onClose={() => {updateAddingPoll(false)}}
              title="Add poll"
            >
              <AddPoll
                choices={pollChoices}
                onChangeChoices={updatePollChoices}
                onDone={() => {updateAddingPoll(false)}}
              />
            </PillModal>
          </>
        }
        <ContentTextarea
          content={content}
          onChange={(newContent) => {
            updateContent(newContent)
          }}
          disabled={posting}
          textAreaClassName='new-post-text-box'
        />
      </div>

      <div className='new-post-sharing-scope'>
        <Select
          placeholder='Who can see it'
          isMulti={true}
          isClearable={false}
          options={sharingScopeSelections}
          value={sharingScope}
          onChange={sharingScopeOnChange}
          isDisabled={posting}
          className='new-post-sharing-scope-dropdown'
        />
        <div className='new-post-sharing-scope-question' onClick={e => {
          e.preventDefault()
          updateSharingScopeExplanationOpened(true)
        }}>
          <QuestionMarkCircleIcon />
        </div>
        <PillModal
          isOpen={sharingScopeExplanationOpened}
          onClose={() => {updateSharingScopeExplanationOpened(false)}}
          title='Who can see it'
        >
          <p>"Public" means anyone on this site who follows you can see this post</p>
          <p>If you only pick circles, only people in these circles who follow you can see this post</p>
          <p>You can pick both "Public" and circles but that still means anyone on this site can see this post. Circle
            selections in this case are just for your own record.</p>
        </PillModal>
      </div>
      {props.resharePostData === null &&
        <div className="new-post-resharable">
          <PillCheckbox
            checked={resharable}
            onChange={resharableOnChange}
            label='Enable Resharing'
            disabled={posting}
          />
          <div className='new-post-enable-resharing-question' onClick={e => {
            e.preventDefault()
            updateEnableResharingExplanationOpened(true)
          }}>
            <QuestionMarkCircleIcon />
          </div>
          <PillModal
            isOpen={enableResharingExplanationOpened}
            onClose={() => {updateEnableResharingExplanationOpened(false)}}
            title='Enable Resharing'
          >
            <p>If you enable resharing, other users can potentially reshare the post to "public" (anyone on this
              site)</p>
            <p>All interactions such as comments and reactions belong to the resharing post unless users explicitly
              click into your original post and interact with it</p>
          </PillModal>
        </div>
      }
      <div className='new-post-btns'>
        {props.resharePostData === null ?
          <div
            className={!isValid() || posting ? 'new-post-post-btn new-post-post-btn-disabled' : 'new-post-post-btn'}
            onClick={postButtonOnClick}
          >
            Post
          </div> :
          <div className='new-post-reshare-controls'>
            <div className='new-post-reshare-question' onClick={e => {
              e.preventDefault()
              updateReshareExplanationOpened(true)
            }}>
              <QuestionMarkCircleIcon />
            </div>
            <div
              className={!isValid() || posting ? 'new-post-post-btn new-post-post-btn-disabled' : 'new-post-post-btn'}
              onClick={postButtonOnClick}
            >
              Reshare
            </div>
            <PillModal
              isOpen={reshareExplanationOpened}
              onClose={() => {updateReshareExplanationOpened(false)}}
              title='Reshare'
            >
              <p>If you reshare a resharing post, you will be resharing the original post instead of the resharing
                post</p>
              <p>You post is reshareable by default</p>
            </PillModal>
          </div>
        }
      </div>
    </div>
  )
}
