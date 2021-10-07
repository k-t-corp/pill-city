import React, {useState} from 'react';
import {useHotkeys} from "react-hotkeys-hook";
import "./MediaPreview.css"

interface Props {
  mediaUrls: string[]
  oneRowHeight: string
  twoRowHeight: string
  threeRowHeight: string
  forLinkPreview?: boolean
}

export default (props: Props) => {
  // todo: pretty hack that only works for link previews with one image...
  const forLinkPreview = props.forLinkPreview !== undefined ? props.forLinkPreview : false
  const mediaCount = props.mediaUrls.length
  if (mediaCount === 0) {
    return null
  }

  const [mediaOpenedIndex, updateMediaOpenedIndex] = useState(-1)

  const openMedia = (index: number) => {
    updateMediaOpenedIndex(index)
  }

  const dismissOpenedMedia = () => {
    updateMediaOpenedIndex(-1)
  }

  useHotkeys('esc', () => {
    dismissOpenedMedia()
  })

  let widthPerPreview = "31%"
  if (mediaCount === 2 || mediaCount === 4) {
    widthPerPreview = "46%"
  } else if (mediaCount === 1) {
    widthPerPreview = "100%"
  }

  let heightPerPreview
  if (mediaCount <= 3) {
    heightPerPreview = props.oneRowHeight
  } else if (mediaCount <= 6) {
    heightPerPreview = props.twoRowHeight
  } else if (mediaCount <= 9) {
    heightPerPreview = props.threeRowHeight
  }

  let mediaPreviewElems = []
  for (let i = 0; i < mediaCount; i++) {
    const mediaUrl = props.mediaUrls[i]
    mediaPreviewElems.push(
      <div
        className={!forLinkPreview ? "media-preview" : "media-preview media-preview-for-link-preview"}
        key={i}
        style={{
          width: widthPerPreview,
          height: heightPerPreview,
        }}
        onClick={e => {
          e.preventDefault()
          openMedia(i)
        }}
      >
        <img
          className={!forLinkPreview ? "media-preview-img" : "media-preview-img media-preview-img-for-link-preview"}
          src={mediaUrl} alt=""
        />
      </div>
    )
  }

  return (
    <div
      className={!forLinkPreview ? "media-preview-container" : "media-preview-container media-preview-container-for-link-preview"}
    >
      {mediaPreviewElems}
      {
        mediaOpenedIndex !== -1 &&
        <div className="media-preview-full" onClick={dismissOpenedMedia}>
          <img className="media-preview-full-img" src={props.mediaUrls[mediaOpenedIndex]} alt=""/>
        </div>
      }
    </div>)
}
