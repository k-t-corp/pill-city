import * as React from "react";
import { Tweet } from 'react-twitter-widgets'
import YouTube from 'react-youtube'
import Post from "../../models/Post";
import './LinkPreview.css'

interface Props {
  post: Post
}

// https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
const regExForUrl = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*))/g

const parseUrls = (content: string): string[] => {
  // @ts-ignore
  return [...content.matchAll(regExForUrl)].map(a => a[1])
}

const twitterTidRegex = /\/status\/(\d+)/

const renderTwitterLinkPreview = (url: URL) => {
  const tidMatches = url.pathname.match(twitterTidRegex)
  if (tidMatches === null) {
    return null
  }
  const tid = tidMatches[1]
  return <Tweet
    tweetId={tid}
    options={{
      dnt: true
    }}
  />
}

const renderYouTubeLinkPreview = (url: URL) => {
  const vid = url.searchParams.get('v')
  if (vid === null) {
    return null
  }
  return <YouTube videoId={vid} containerClassName='link-preview-youtube-container'/>
}

const renderLinkPreview = (url: URL) => {
  if (url.hostname === 'twitter.com' || url.hostname === 'www.twitter.com') {
    return renderTwitterLinkPreview(url)
  } else if (url.hostname === 'youtube.com' || url.hostname === 'www.youtube.com') {
    return renderYouTubeLinkPreview(url)
  } else {
    // TODO
    return null
  }
}

export default (props: Props) => {
  const urls = parseUrls(props.post.content)
  if (urls.length === 0) {
    return null
  }
  const linkPreviewElems = []
  for (let i = 0; i < urls.length; ++i) {
    const url = urls[i]
    try {
      linkPreviewElems.push(
        <div key={i}>
          {renderLinkPreview(new URL(url))}
        </div>
      )
    } catch {
    }
  }
  return (
    <div>
      {linkPreviewElems}
    </div>
  )
}
