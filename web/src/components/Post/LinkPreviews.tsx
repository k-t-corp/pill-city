import React, {useState} from "react";
import LinkPreview from "../LinkPreview/LinkPreview";
import Post from "../../models/Post";
import LinkPreviewModel from "../../models/LinkPreview";
import {useInterval} from "react-interval-hook";
import api from "../../api/Api";
import './LinkPreviews.css'

interface Props {
  post: Post
}

export default (props: Props) => {
  if (props.post.link_previews.length === 0) {
    return null
  }

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

  return (
    <div className='link-previews'>
      {previews.map(_ => <LinkPreview key={_.url} preview={_}/>)}
    </div>
  )
}
