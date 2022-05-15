import React, {useState} from 'react'
import {useInterval} from "react-interval-hook";
import LinkPreview from "../../models/LinkPreview";
import summary from "../../utils/summary";
import api from '../../api/Api'
import './FetchedPreview.css'

interface Props {
  url: string
  onClick: () => void
}

export default (props: Props) => {
  const [preview, updatePreview] = useState<LinkPreview | null>(null)

  useInterval(async () => {
    if (preview === null || preview.state === 'fetching') {
      updatePreview(await api.getLinkPreview(props.url))
    }
  }, 5000, { immediate: true })

  useInterval(async () => {
    if (preview !== null && preview.state === 'errored') {
      updatePreview(await api.getLinkPreview(props.url))
    }
  }, 10000)

  if (preview === null || preview.state === 'fetching') {
    return null
  } else if (preview.state === 'errored') {
    return (
      <div className="fetched-preview">
        Failed to fetch preview for {' '}
        <a
          href={props.url}
          className='fetched-preview-link'
          target="_blank"
          rel="noreferrer noopener"
        >{props.url}</a> {' '}
        {`(Retry in ${preview.retry_in_seconds} seconds)`}
      </div>
    )
  } else {
    return (
      <div onClick={props.onClick}>
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
          (preview.title || preview.subtitle) &&
            <div
              className={preview.image_urls.length === 0 ? "fetched-preview" : "fetched-preview fetched-preview-with-image"}
            >
              <div className='fetched-preview-title'>{summary(preview.title, 100)}</div>
              <div className='fetched-preview-subtitle'>{summary(preview.subtitle, 150)}</div>
            </div>
        }
      </div>
    )
  }
}
