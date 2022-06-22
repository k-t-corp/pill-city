import React from 'react'
import LinkPreview from "../../models/LinkPreview";
import summary from "../../utils/summary";
import './FetchedPreview.css'
import {futureTime} from "../../utils/timeDelta";

interface Props {
  preview: LinkPreview
  onClick: () => void
}

export default (props: Props) => {
  const {preview} = props
  const title = preview.title.trim()
  const subtitle = preview.subtitle.trim()

  if (preview.state === 'fetching') {
    return (
      <div className="fetched-preview">
        Fetching preview for {' '}
        <a
          href={preview.url}
          className='fetched-preview-link'
          target="_blank"
          rel="noreferrer noopener"
        >{preview.url}</a>
      </div>
    )
  } else if (preview.state === 'errored') {
    return (
      <div className="fetched-preview">
        Failed to fetch preview for {' '}
        <a
          href={preview.url}
          className='fetched-preview-link'
          target="_blank"
          rel="noreferrer noopener"
        >{preview.url}</a> {' '}
        {`(Retrying in ${futureTime(preview.errored_next_refetch_seconds)})`}
      </div>
    )
  } else {
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
}
