import React, {useState} from "react";
import LinkPreview from "../LinkPreview/LinkPreview";
import {Previewable} from "../../models/Post";
import './Previews.css'
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/solid";

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
  const {content} = props.post

  const previewElems = []

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
          <ChevronLeftIcon />
        </div>
        <span>{showingIndex + 1}/{previewElems.length}</span>
        <div
          className={`previews-nav${showingIndex === previewElems.length - 1 ? ' previews-nav-hidden' : ''}`}
          onClick={() => updateShowingIndex(showingIndex + 1)}
        >
          <ChevronRightIcon />
        </div>
      </div>
    </div>
  )
}
