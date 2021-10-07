import React from "react";
import {Timeline, Tweet} from "react-twitter-widgets";
import YouTube from "react-youtube";
import './InstantPreview.css'

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
const twitterStatusRegex = /\/status\/(\d+)/
const twitterProfileRegex = /^\/([a-zA-Z0-9_]{1,15})$/

interface TwitterTweetInstantPreview {
  twitterTweetId: string
}

interface TwitterProfileInstantPreview {
  twitterHandle: string
}

interface YouTubeVideoInstantPreview {
  youtubeVideoId: string
}

type InstantPreviews = TwitterTweetInstantPreview | TwitterProfileInstantPreview | YouTubeVideoInstantPreview

export const getInstantPreview = (parsedUrl: URL): InstantPreviews | undefined => {
  if (twitterDomains.indexOf(parsedUrl.hostname) !== -1) {
    const statusMatches = parsedUrl.pathname.match(twitterStatusRegex)
    if (statusMatches !== null) {
      return {
        twitterTweetId: statusMatches[1]
      }
    }
    const profileMatches = parsedUrl.pathname.match(twitterProfileRegex)
    if (profileMatches !== null) {
      return {
        twitterHandle: profileMatches[1]
      }
    }
  }
  if (youtubeDomains.indexOf(parsedUrl.hostname) !== -1) {
    if (parsedUrl.pathname === '/watch') {
      const vid = parsedUrl.searchParams.get('v')
      if (vid !== null) {
        return {
          youtubeVideoId: vid
        }
      }
    }
  }
}

interface Props {
  instantPreview: InstantPreviews
}

export default (props: Props) => {
  const { instantPreview } = props

  if ('twitterTweetId' in instantPreview) {
    return (
      <Tweet
        tweetId={instantPreview.twitterTweetId}
        options={{
          dnt: true,
        }}
      />
    )
  }
  if ('twitterHandle' in instantPreview) {
    return (
      <Timeline
        dataSource={{
          sourceType: 'profile',
          screenName: instantPreview.twitterHandle
        }}
        options={{
          dnt: true,
          // this height is the same with tweet
          height: 851
        }}
      />
    )
  }
  if ("youtubeVideoId" in instantPreview) {
    return (
      <YouTube
        videoId={instantPreview.youtubeVideoId}
        containerClassName='link-preview-youtube-container'
      />
    )
  }
  return null
}
