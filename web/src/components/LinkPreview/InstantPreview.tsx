import React from "react";
import YouTube from "react-youtube";
import './InstantPreview.css'

const youtubeDomains = [
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
]

const youtubeShortDomains = [
  "youtu.be"
]

interface YouTubeVideoInstantPreview {
  youtubeVideoId: string
}

type InstantPreviews = YouTubeVideoInstantPreview

export const getInstantPreview = (url: string): InstantPreviews | undefined => {
  let parsedUrl
  try {
    parsedUrl = new URL(url)
  } catch (e) {
    return
  }

  if (!parsedUrl) {
    return
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
  } else if (youtubeShortDomains.indexOf(parsedUrl.hostname) !== -1) {
    return {
      youtubeVideoId: parsedUrl.pathname.split('/')[1]
    }
  }
}

interface Props {
  instantPreview: InstantPreviews
}

export default (props: Props) => {
  const { instantPreview } = props

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
