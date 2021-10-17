import React from "react";
import YouTube from "react-youtube";
import './InstantPreview.css'

const youtubeDomains = [
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com"
]

interface YouTubeVideoInstantPreview {
  youtubeVideoId: string
}

type InstantPreviews = YouTubeVideoInstantPreview

export const getInstantPreview = (parsedUrl: URL): InstantPreviews | undefined => {
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
