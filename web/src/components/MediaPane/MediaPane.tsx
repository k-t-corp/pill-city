import React, {useState} from 'react';
import {useHotkeys} from "react-hotkeys-hook";
import "./MediaPane.css"

interface Props {
  mediaUrls: string[]
  onMediaClick?: (i: number) => void
}

export default (props: Props) => {
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

  let mediaList = []
  for (let i = 0; i < mediaCount; i++) {
    const mediaUrl = props.mediaUrls[i]
    mediaList.push(
      <div
        // className={!forLinkPreview ? "media-preview" : "media-preview media-preview-for-link-preview"}
        key={i}
        style={{
          width: widthPerPreview,
          // height: heightPerPreview,
        }}
        onClick={e => {
          e.preventDefault()
          if (props.onMediaClick) {
            props.onMediaClick(i)
          } else {
            openMedia(i)
          }
        }}
      >
        <img
          // className={!forLinkPreview ? "media-preview-img" : "media-preview-img media-preview-img-for-link-preview"}
          src={mediaUrl} alt=""
        />
      </div>
    )
  }

  return (
    <div
      // className={!forLinkPreview ? "media-preview-container" : "media-preview-container media-preview-container-for-link-preview"}
    >
      {mediaList}
      {
        mediaOpenedIndex !== -1 &&
        <div className="media-preview-full" onClick={dismissOpenedMedia}>
          <img className="media-preview-full-img" src={props.mediaUrls[mediaOpenedIndex]} alt=""/>
        </div>
      }
    </div>)
}
