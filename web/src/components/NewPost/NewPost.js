import React, {useState} from 'react'
import {Dropdown, Popup, Icon, Checkbox} from 'semantic-ui-react'
import "./NewPost.css"
import getAvatarUrl from "../../api/getAvatarUrl";

export default (props) => {
  const [content, updateContent] = useState("")
  const [circleNames, updateCircleNames] = useState([])
  const [posting, updatePosting] = useState(false)
  const [resharableToggleChecked, updateResharableToggleChecked] = useState(true)

  const isValid = () => {
    return content.trim().length !== 0 && circleNames.length !== 0
  }
  const parseContent = (content, className) => {
    const regExForStrikeThrough = / -(.+)- /g
    const regExForItalic = / _(.+)_ /g
    const regExForBold = / \*(.+)\* /g
    let newContent = content.replace(regExForStrikeThrough, '<del>$1</del>');
    newContent = newContent.replace(regExForItalic, '<i>$1</i>')
    newContent = newContent.replace(regExForBold, '<b>$1</b>')
    return <div className={className} dangerouslySetInnerHTML={{__html: newContent}}/>
  }
  const postButtonOnClick = async () => {
    updatePosting(true);
    const actualCircleNames = circleNames.filter(cn => cn !== true)
    const isPublic = circleNames.filter(cn => cn === true).length !== 0
    await props.api.postPost(
      content,
      isPublic,
      actualCircleNames,
      resharableToggleChecked,
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
          {parseContent(props.resharePostData.content, "")}
        </div>
      }
      <textarea
        className="new-post-text-box"
        value={content}
        onChange={e => {
          e.preventDefault();
          updateContent(e.target.value)
        }}
      />
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
            <p>If you enable resharing, other users can potentially reshare the post to "public" (anyone on this site)</p>
            <p>All interactions such as comments and reactions belong to the resharing post unless users explicitly click into your original post and interact with it</p>
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
            <p>If you reshare a resharing post, you will be resharing the original post instead of the resharing post</p>
            <p>You post is reshareable by default</p>
          </Popup>
        }
      </div>
    </div>
  )
}
