import React from 'react';
import "./MediaPreview.css"

export default (props) => {
  const mediaCount = props.mediaUrls.length
  if (mediaCount === 0) return null
  let mediaPreview = []

  let widthOfPreview = "31%"
  if (mediaCount === 2 || mediaCount === 4) {
    widthOfPreview = "46%"
  } else if (mediaCount === 1) {
    widthOfPreview = "100%"
  }

  let height
  if (mediaCount <= 3) {
    height = props.oneRowHeight
  } else if (mediaCount <= 6) {
    height = props.twoRowHeight
  } else if (mediaCount <= 9) {
    height = props.threeRowHeight
  }

  for (let i = 0; i < mediaCount; i++) {
    const mediaUrl = props.mediaUrls[i]
    mediaPreview.push(
      <div
        className="new-post-media-preview"
        key={i}
        style={{
          width: widthOfPreview,
          height: height,
          cursor: props.onMediaClicked ? 'pointer' : 'auto'
        }}
        onClick={e => {
          e.preventDefault()
          if (props.onMediaClicked) {
            props.onMediaClicked(mediaUrl)
          }
        }}
      >
        <img className="new-post-media-preview-img" src={mediaUrl} alt=""/>
      </div>)
  }
  return (
    <div className="new-post-media-preview-container">
      {mediaPreview}
    </div>)
}
