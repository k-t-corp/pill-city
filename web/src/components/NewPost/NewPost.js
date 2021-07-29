import React, {useState} from 'react'
import "./NewPost.css"

export default (props) => {
  const [posting, updatePosting] = useState(false)
  const [validContent, updateValidContent] = useState(false)
  const postButtonOnclick = async () => {
    updatePosting(true);
    const content = document.getElementById("new-post-content").value;
    await props.api.postPost(content);
    window.location.reload();
  }

  const onContentChange = () => {
    const textAreaElement = document.getElementById("new-post-content")
    const currentContent = textAreaElement.value;
    updateValidContent(currentContent.trim().length !== 0);
  }


  const buttonClass = () => {
    let className = ["new-post-post-btn"]
    if (!validContent) {
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
          {props.userinfo.user.id}
        </div>
      </div>
      <textarea className="new-post-text-box" id="new-post-content" onChange={onContentChange}/>
      <div className="new-post-btns">
        <div className={buttonClass()} onClick={postButtonOnclick}>
          Post
        </div>
      </div>
    </div>
  )
}
