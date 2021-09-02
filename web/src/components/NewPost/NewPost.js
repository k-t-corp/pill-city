import React, {useState} from 'react'
import {Dropdown, Popup, Icon, Checkbox} from 'semantic-ui-react'
import "./NewPost.css"
import getAvatarUrl from "../../api/getAvatarUrl";
import parseContent from "../../parseContent";
import FormData from "form-data";

export default (props) => {
  const [content, updateContent] = useState("")
  const [circleNames, updateCircleNames] = useState([])
  const [posting, updatePosting] = useState(false)
  const [resharableToggleChecked, updateResharableToggleChecked] = useState(true)
  const [medias, updateMedias] = useState([])

  const isValid = () => {
    return content.trim().length !== 0 && circleNames.length !== 0
  }
  const postButtonOnClick = async () => {
    updatePosting(true);
    const actualCircleNames = circleNames.filter(cn => cn !== true)
    const isPublic = circleNames.filter(cn => cn === true).length !== 0
    await props.api.postPost(
      content,
      isPublic,
      actualCircleNames,
      props.resharePostData === null ? resharableToggleChecked : true,
      props.resharePostData === null ? null : props.resharePostData.id);
    window.location.reload();
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

  const mediasPreviewElem = () => {
    const mediaCount = medias.length
    if (mediaCount === 0) return null
    let mediaPreview = []
    let col = 3
    let widthOfPreview = "32%"
    if (mediaCount === 2 || mediaCount === 4) {
      col = 2
      widthOfPreview = "48%"
    } else if (mediaCount === 1) {
      col = 1
      widthOfPreview = "100%"
    }

    let row
    let height = "90px"
    if (mediaCount <= 3) {
      row = 1
      height = "130px"
    } else if (mediaCount <= 6) {
      row = 2
    } else if (mediaCount <= 9) {
      row = 3
    }

    for (let i = 0; i < mediaCount; i++) {
      let marginBottom = "10px"
      if (Math.ceil((i + 1) / col) === row) marginBottom = "0"
      mediaPreview.push(
        <div className="new-post-media-preview" key={i}
             style={{
               width: widthOfPreview,
               height: height,
               marginBottom: marginBottom
             }}>
          <img className="new-post-media-preview-img" src={medias[i]} alt=""/>
        </div>)
    }
    return (
      <div className="new-post-media-preview-container">
        {mediaPreview}
      </div>)
  }

  const changeMediasOnClick = (event) => {
    console.log("length", event.target.files.length)
    if (event.target.files && event.target.files[0]) {
      if (event.target.files.length > 9) {
        alert(`Only 9 files are allowed to upload.`);
      } else {
        let selectedMedias = []
        for (let i = 0; i < event.target.files.length; i++) {
          selectedMedias.push(URL.createObjectURL(event.target.files[i]))
        }
        console.log("selected media", selectedMedias)

        updateMedias(selectedMedias)
      }
      // let img = event.target.files[0];
      // updateUploadedAvatarImage(URL.createObjectURL(img))
      console.log("medias", medias)
    }
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
          <div className="post-content">
            {parseContent(props.resharePostData.content, "")}
          </div>
        </div>
      }
      {mediasPreviewElem()}
      <div className="new-post-text-box-container">
        <label className="new-post-attachment-button">
          <input id="new-post-change-medias-button"
                 accept="image/*"
                 type="file"
                 onChange={changeMediasOnClick}
                 multiple={true}/>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
          </svg>

        </label>
        <textarea
          className="new-post-text-box"
          value={content}
          onChange={e => {
            e.preventDefault();
            updateContent(e.target.value)
          }}
        />
      </div>

      <div className='new-post-circles-dropdown-wrapper'>
        <Dropdown
          placeholder='Who can see it'
          options={
            [{key: 'public', text: '🌏 Public', value: true}].concat(
              props.circles.map(circle => {
                const {name} = circle
                return {key: name, text: `⭕ ${name}`, value: name}
              })
            )
          }
          value={circleNames}
          onChange={(e, {value}) => {
            e.preventDefault();
            updateCircleNames(value)
          }}
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
          <Checkbox toggle
                    label="Enable Resharing"
                    onChange={() => updateResharableToggleChecked(!resharableToggleChecked)}
                    checked={resharableToggleChecked}
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
