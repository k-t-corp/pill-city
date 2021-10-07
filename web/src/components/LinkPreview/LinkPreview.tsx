import * as React from "react";
import {WithContent} from "../../models/Post";
import InstantPreview, {getInstantPreview} from "./InstantPreview";
import './LinkPreview.css'

interface Props {
  post: WithContent
}

// https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
const regExForUrl = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*))/g

const parseUrls = (content: string): string[] => {
  // @ts-ignore
  return [...content.matchAll(regExForUrl)].map(a => a[1])
}

export default (props: Props) => {
  const urls = parseUrls(props.post.content)
  if (urls.length === 0) {
    return null
  }
  const linkPreviewElems = []
  for (let i = 0; i < urls.length; ++i) {
    const url = urls[i]
    let parsedUrl
    try {
      parsedUrl = new URL(url)
    } catch {}
    if (!parsedUrl) {
      continue
    }

    let preview
    const instantPreview = getInstantPreview(parsedUrl)
    if (instantPreview) {
      preview = <InstantPreview instantPreview={instantPreview}/>
    } else {
      // TODO
    }
    linkPreviewElems.push(
      <div key={i}>{preview}</div>
    )
  }
  return (
    <div>
      {linkPreviewElems}
    </div>
  )
}
