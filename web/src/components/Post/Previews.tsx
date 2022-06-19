import React, {useState} from "react";
import LinkPreview from "../LinkPreview/LinkPreview";
import Post from "../../models/Post";
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/solid";
import LinkPreviewModel from "../../models/LinkPreview";
import {useInterval} from "react-interval-hook";
import api from "../../api/Api";
import './Previews.css'

interface Props {
  post: Post
}

export default (props: Props) => {
  const [previews, updatePreviews] = useState<LinkPreviewModel[]>(props.post.link_previews)

  useInterval(async () => {
    for (let preview of previews) {
      if (preview.state === 'fetching') {
        const newPreview = await api.getLinkPreview(preview.url)
        updatePreviews(previews.map(p => {
          if (p.url !== preview.url) {
            return p
          }
          return newPreview
        }))
      }
    }
  }, 5000, { immediate: true })

  const previewElems = previews.map(_ => <LinkPreview key={_.url} preview={_}/>)

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
