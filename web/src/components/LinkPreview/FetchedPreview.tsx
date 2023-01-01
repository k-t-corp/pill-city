import React from 'react'
import LinkPreview from "../../models/LinkPreview";
import summary from "../../utils/summary";
import './FetchedPreview.css'

interface Props {
  preview: LinkPreview
  onClick: () => void
}

const FetchedPreview = (props: Props) => {
  const {preview} = props
  if (preview.state !== 'fetched') {
    return null
  }

  const title = preview.title.trim()
  const subtitle = preview.subtitle.trim()

  return (
    <div onClick={e => {
      e.preventDefault()
      props.onClick()
    }}>
      {
        (preview.image_urls || []).length !== 0 &&
          <div className='fetched-preview-image-container'>
            <img
              className='fetched-preview-image'
              // TODO: we assume we only have one preview image for now
              src={preview.image_urls[0]}
              alt={''}
            />
          </div>

      }
      {
        (title || subtitle) &&
          <div
            className={preview.image_urls.length === 0 ? "fetched-preview" : "fetched-preview fetched-preview-with-image"}
          >
            <div className='fetched-preview-title'>{summary(title, 100)}</div>
            <div className='fetched-preview-subtitle'>{summary(subtitle, 150)}</div>
          </div>
      }
    </div>
  )
}

export default FetchedPreview
