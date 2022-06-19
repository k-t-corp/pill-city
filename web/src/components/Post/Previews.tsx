import React, {useState} from "react";
import LinkPreview from "../LinkPreview/LinkPreview";
import Post from "../../models/Post";
import './Previews.css'
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/solid";

interface Props {
  post: Post
}

export default (props: Props) => {
  const previewElems = props.post.link_previews.map(_ => <LinkPreview preview={_}/>)

  if (previewElems.length === 0) {
    return null
  }
  if (previewElems.length === 1) {
    return previewElems[0]
  }

  const [showingIndex, updateShowingIndex] = useState(0)

  return (
    <div>
      {previewElems[showingIndex]}
      <div className='previews-nav-wrapper'>
        <div
          className={`previews-nav${showingIndex === 0 ? ' previews-nav-hidden' : ''}`}
          onClick={() => updateShowingIndex(showingIndex - 1)}
        >
          <ChevronLeftIcon />
        </div>
        <span>{showingIndex + 1}/{previewElems.length}</span>
        <div
          className={`previews-nav${showingIndex === previewElems.length - 1 ? ' previews-nav-hidden' : ''}`}
          onClick={() => updateShowingIndex(showingIndex + 1)}
        >
          <ChevronRightIcon />
        </div>
      </div>
    </div>
  )
}
