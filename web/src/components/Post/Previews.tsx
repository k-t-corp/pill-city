import MediaPreview from "../MediaPreview/MediaPreview";
import React from "react";
import LinkPreview from "../LinkPreview/LinkPreview";
import {Previewable} from "../../models/Post";
import {useMediaQuery} from "react-responsive";

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
  api: any
}

export default (props: Props) => {
  const {deleted, media_urls: mediaUrls, content} = props.post
  const isTabletOrMobile = useMediaQuery({query: '(max-width: 750px)'})

  const parsedUrls = parseUrls(content)
  const linkPreviewElems = []
  for (const parsedUrl of parsedUrls) {
    linkPreviewElems.push(<LinkPreview api={props.api} url={parsedUrl}/>)
  }

  if (deleted) {
    return null
  }

  return (
    <div>
      <MediaPreview
        mediaUrls={mediaUrls}
        threeRowHeight="130px"
        twoRowHeight="150px"
        oneRowHeight={isTabletOrMobile ? "200px" : "280px"}
      />
      {linkPreviewElems}
    </div>
  )
}
