import React, {useState} from 'react'
import {Dropdown, Popup, Icon, Checkbox} from 'semantic-ui-react'
import "./NewPost.css"
import getAvatarUrl from "../../api/getAvatarUrl";
import parseContent from "../../parseContent";
import FormData from "form-data";
import MediaPreview from "../MediaPreview/MediaPreview";
import {useMediaQuery} from "react-responsive";
import parseMentioned from "../../parseMentioned";
import {useHotkeys} from "react-hotkeys-hook";

export default (props) => {
  const [content, updateContent] = useState("")
  const [circleIds, updateCircleIds] = useState([])
  const [resharableToggleChecked, updateResharableToggleChecked] = useState(true)
  const [medias, updateMedias] = useState([])

  const [posting, updatePosting] = useState(false)
  const isTabletOrMobile = useMediaQuery({query: '(max-width: 750px)'})

  const isValid = () => {
    return (content.trim().length !== 0 || medias.length !== 0) && circleIds.length !== 0
  }

  const reset = () => {
    updateContent('')
    updateCircleIds([])
    updateResharableToggleChecked(true)
    updateMedias([])
  }

  useHotkeys('ctrl+enter', async () => {
    console.log('NewPost ctrl+enter')
    if (content.endsWith('\n')) {
      // if sent using ctrl+enter, there should be an extra newline at the end
      updateContent(content.substring(0, content.length - 1))
    }
    if (isValid()) {
      await postButtonOnClick()
    }
  }, {
    enableOnTags: ['TEXTAREA']
  })

  const postButtonOnClick = async () => {
    if (posting) {
      return
    }
    updatePosting(true);
    const actualCircleIds = circleIds.filter(cn => cn !== true)
    const isPublic = circleIds.filter(cn => cn === true).length !== 0
    let mediaData = new FormData()
    for (let i = 0; i < medias.length; i++) {
      const blob = new Blob([medias[i]], {type: 'image/*'})
      mediaData.append(`media${i}`, blob, blob.name)
    }
    props.beforePosting()
    const post = await props.api.postPost(
      content,
      isPublic,
      actualCircleIds,
      props.resharePostData === null ? resharableToggleChecked : true,
      props.resharePostData === null ? null : props.resharePostData.id,
      props.resharePostData === null ? mediaData : [],
      parseMentioned(content)
    );
    reset()
    props.afterPosting(post)
    updatePosting(false)
  }

  const changeMediasOnClick = (event) => {
    if (posting) {
      return
    }
    if (event.target.files && event.target.files[0]) {
      if (event.target.files.length > 4) {
        alert(`Only allowed to upload 4 images`);
      } else {
        let selectedMedias = []
        for (let i = 0; i < event.target.files.length; i++) {
          selectedMedias.push(event.target.files[i])
        }
        updateMedias(selectedMedias)
      }
    }
  }

  const contentOnChange = e => {
    e.preventDefault();
    if (posting) {
      return
    }
    updateContent(e.target.value)
  }

  const sharingScopeOnChange = (e, {value}) => {
    e.preventDefault();
    if (posting) {
      return
    }
    updateCircleIds(value)
  }

  const resharableOnChange = e => {
    e.preventDefault();
    if (posting) {
      return
    }
    updateResharableToggleChecked(!resharableToggleChecked)
  }

  const submitButtonClass = () => {
    let className = ["new-post-post-btn"]
    if (!isValid()) {
      className.push("new-post-post-btn-invalid")
    }
    if (posting) {
      className.push("new-post-post-btn-loading ")
    }
    return className.join(" ")
  }

  return (
    <div className="new-post">
      <div className="new-post-user-info">
        <div className="new-post-avatar">
          <img
            className="new-post-avatar-img"
            src={getAvatarUrl(props.me)}
            alt=""
          />
        </div>
        <div className="new-post-name">
          {props.me !== null ? props.me.id : '...'}
        </div>
      </div>
      {props.resharePostData === null ? null :
        <div className="new-post-reshare-preview">
          <div className="new-post-reshared-info-wrapper">
            <div className="new-post-reshared-info">
              <div className="post-avatar post-reshared-avatar">
                <img
                  className="post-avatar-img"
                  src={getAvatarUrl(props.resharePostData.author)}
                  alt=""
                />
              </div>
              <div className="post-reshared-author">
                {props.resharePostData.author.id}
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
      {props.resharePostData === null ?
        <MediaPreview mediaUrls={medias.map(m => URL.createObjectURL(m))}
                      threeRowHeight={isTabletOrMobile ? "30px" : "80px"}
                      twoRowHeight={isTabletOrMobile ? "50px" : "100px"}
                      oneRowHeight={isTabletOrMobile ? "80px" : "140px"}/>
        : null}
      <div className="new-post-text-box-container">
        {props.resharePostData === null ?
          <label className="new-post-attachment-button">
            <input
              id="new-post-change-medias-button"
              accept="image/*"
              type="file"
              onChange={changeMediasOnClick}
              multiple={true}
              disabled={posting}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"/>
            </svg>
          </label> : null}
        <textarea
          className="new-post-text-box"
          value={content}
          onChange={contentOnChange}
          disabled={posting}
        />
      </div>

      <div className='new-post-circles-dropdown-wrapper'>
        <Dropdown
          placeholder='Who can see it'
          options={
            [{key: 'public', text: '🌏 Public', value: true}].concat(
              props.circles.map(circle => {
                const {name, id} = circle
                return {key: name, text: `⭕ ${name}`, value: id}
              })
            )
          }
          value={circleIds}
          onChange={sharingScopeOnChange}
          disabled={posting}
          fluid multiple selection
        />
        <Popup
          trigger={
            <Icon
              className='new-post-circles-dropdown-question'
              name='question circle outline'
            />
          }
          position='top right'
          basic
        >
          <p>"Public" means anyone on this site who follows you can see this post</p>
          <p>If you only pick circles, only people in these circles who follow you can see this post</p>
          <p>You can pick both "Public" and circles but that still means anyone on this site can see this post. Circle
            selections in this case are just for your own record</p>
        </Popup>
      </div>
      {props.resharePostData === null ?
        <div className="new-post-resharable">
          <Checkbox
            toggle
            label="Enable Resharing"
            onChange={resharableOnChange}
            checked={resharableToggleChecked}
            disabled={posting}
          />
          <Popup
            trigger={
              <Icon
                className='new-post-circles-dropdown-question'
                name='question circle outline'
              />
            }
            position='top right'
            basic
          >
            <p>If you enable resharing, other users can potentially reshare the post to "public" (anyone on this
              site)</p>
            <p>All interactions such as comments and reactions belong to the resharing post unless users explicitly
              click into your original post and interact with it</p>
          </Popup>
        </div> : null
      }
      <div className='new-post-btns'>
        {props.resharePostData === null ?
          <div className={submitButtonClass()} onClick={postButtonOnClick}>
            Post
          </div> :
          <Popup
            trigger={
              <div className={submitButtonClass()} onClick={postButtonOnClick}>
                Reshare
              </div>
            }
            position='top right'
            basic
          >
            <p>If you reshare a resharing post, you will be resharing the original post instead of the resharing
              post</p>
            <p>You post is reshareable by default</p>
          </Popup>
        }
      </div>
    </div>
  )
}
