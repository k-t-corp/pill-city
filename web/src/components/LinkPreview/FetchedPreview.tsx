import React, {useState} from 'react'
import {useInterval} from "react-interval-hook";
import LinkPreview from "../../models/LinkPreview";

interface Props {
  api: any,
  url: string
}

export default (props: Props) => {
  const [preview, updatePreview] = useState<LinkPreview | null>(null)

  useInterval(async () => {
    if (preview === null || preview.state === 'fetching') {
      updatePreview(await props.api.getLinkPreview(props.url))
    }
  }, 5000, { immediate: true })

  if (preview === null || preview.state === 'fetching') {
    return null
  } else if (preview.state === 'errored') {
    return <div>Failed to fetch link preview for {props.url}</div>
  } else {
    return <div>{preview.title} {preview.subtitle}</div>
  }
}
