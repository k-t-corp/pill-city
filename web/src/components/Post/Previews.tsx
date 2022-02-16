import MediaPreview from "../MediaPreview/MediaPreview";
import React, {useState} from "react";
import LinkPreview from "../LinkPreview/LinkPreview";
import {Previewable} from "../../models/Post";
import {useMediaQuery} from "react-responsive";
import './Previews.css'

// https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
const regExForUrl = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*))/g

const parseUrls = (content: string): URL[] => {
  // @ts-ignore
  return [...content.matchAll(regExForUrl)].map(a => a[1]).map(u => {
    try {
      return new URL(u)
    } catch {
      return null
    }
  }).filter(pu => pu !== null)
}

interface Props {
  post: Previewable
}

export default (props: Props) => {
  const {deleted, media_urls: mediaUrls, content} = props.post
  if (deleted) {
    return null
  }

  const isTabletOrMobile = useMediaQuery({query: '(max-width: 750px)'})

  const previewElems = []

  if (mediaUrls.length > 0) {
    previewElems.push(
      <MediaPreview
        mediaUrls={mediaUrls}
        threeRowHeight="130px"
        twoRowHeight="150px"
        oneRowHeight={isTabletOrMobile ? "200px" : "280px"}
      />
    )
  }

  const parsedUrls = parseUrls(content)
  for (const parsedUrl of parsedUrls) {
    previewElems.push(
      <LinkPreview
        url={parsedUrl}
      />
    )
  }

  if (previewElems.length === 0) {
    return null
  }
  if (previewElems.length === 1) {
    return previewElems[0]
  }

  const [showingIndex, updateShowingIndex] = useState(0)

  return (
    <div>
      {previewElems[showingIndex]}
      <div className='previews-nav-wrapper'>
        <div
          className={`previews-nav${showingIndex === 0 ? ' previews-nav-hidden' : ''}`}
          onClick={() => updateShowingIndex(showingIndex - 1)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <span>{showingIndex + 1}/{previewElems.length}</span>
        <div
          className={`previews-nav${showingIndex === previewElems.length - 1 ? ' previews-nav-hidden' : ''}`}
          onClick={() => updateShowingIndex(showingIndex + 1)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
