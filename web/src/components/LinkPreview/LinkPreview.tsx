import * as React from "react";
import {WithContent} from "../../models/Post";
import InstantPreview, {getInstantPreview} from "./InstantPreview";
import './LinkPreview.css'
import FetchedPreview from "./FetchedPreview";
import {useState} from "react";

interface Props {
  post: WithContent
  api: any
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

  const [showInstantPreview, updateShowInstantPreview] = useState<boolean[]>(urls.map(_ => false))
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

    let instantPreviewElem
    const instantPreview = getInstantPreview(parsedUrl)
    if (instantPreview) {
      instantPreviewElem = <InstantPreview instantPreview={instantPreview}/>
    }
    const fetchedPreviewElem = (
      <FetchedPreview
        url={url}
        api={props.api}
        onClick={() => {
          if (instantPreview) {
            updateShowInstantPreview(showInstantPreview.map((s, ii) => {
              if (ii !== i) {
                return s
              }
              return true
            }))
          } else {
            window.open(url, '_blank')
          }
        }}
      />
    )
    const previewElem = !showInstantPreview[i] ? fetchedPreviewElem : (instantPreview && instantPreviewElem)
    linkPreviewElems.push(
      <div key={i}>{previewElem}</div>
    )
  }
  return (
    <div>
      {linkPreviewElems}
    </div>
  )
}
