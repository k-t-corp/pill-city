import * as React from "react";
import { Tweet, Timeline } from 'react-twitter-widgets'
import YouTube from 'react-youtube'
import {WithContent} from "../../models/Post";
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

const twitterStatusRegex = /\/status\/(\d+)/
const twitterProfileRegex = /^\/([a-zA-Z0-9_]{1,15})$/

const renderTwitterLinkPreview = (url: URL) => {
  const statusMatches = url.pathname.match(twitterStatusRegex)
  if (statusMatches === null) {
    const profileMatches = url.pathname.match(twitterProfileRegex)
    if (profileMatches === null) {
      return null
    }
    const handle = profileMatches[1]
    return <Timeline
      dataSource={{
        sourceType: 'profile',
        screenName: handle
      }}
      options={{
        dnt: true,
        height: 851
      }}
    />
  }
  const tid = statusMatches[1]
  return <Tweet
    tweetId={tid}
    options={{
      dnt: true,
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

const twitterDomains = [
  "twitter.com",
  "www.twitter.com",
  "mobile.twitter.com"
]

const youtubeDomains = [
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com"
]

const renderLinkPreview = (url: URL) => {
  if (twitterDomains.indexOf(url.hostname) !== -1) {
    return renderTwitterLinkPreview(url)
  } else if (youtubeDomains.indexOf(url.hostname) !== -1) {
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
