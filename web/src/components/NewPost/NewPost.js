import React, {useState} from 'react'
import { Dropdown, Popup, Icon } from 'semantic-ui-react'
import "./NewPost.css"

export default (props) => {
  const [content, updateContent] = useState("")
  const [circleNames, updateCircleNames] = useState([])
  const [posting, updatePosting] = useState(false)

  const isValid = () => {
    return content.trim().length !== 0 && circleNames.length !== 0
  }

  const postButtonOnClick = async () => {
    updatePosting(true);
    const actualCircleNames = circleNames.filter(cn => cn !== true)
    const isPublic = circleNames.filter(cn => cn === true).length !== 0
    await props.api.postPost(content, isPublic, actualCircleNames);
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
          <img className="new-post-avatar-img" src={`${process.env.PUBLIC_URL}/kusuou.png`} alt=""/>
        </div>
        <div className="new-post-name">
          {props.me !== null ? props.me.id : '...'}
        </div>
      </div>
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
            [{ key: 'public', text: '🌏 Public', value: true }].concat(
              props.circles.map(circle => {
                const { name } = circle
                return { key: name, text: `⭕ ${name}`, value: name }
              })
            )
          }
          value={circleNames}
          onChange={(e, { value }) => {
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
          <p>You can pick both "Public" and circles but that still means anyone on this site can see this post. Circle selections in this case are just for your own record</p>
        </Popup>
      </div>
      <div className='new-post-btns'>
        <div className={submitButtonClass()} onClick={postButtonOnClick}>
          Post
        </div>
      </div>
    </div>
  )
}
