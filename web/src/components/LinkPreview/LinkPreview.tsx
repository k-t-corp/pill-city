import * as React from "react";
import InstantPreview, {getInstantPreview} from "./InstantPreview";
import FetchedPreview from "./FetchedPreview";
import './LinkPreview.css'
import {useState} from "react";

interface Props {
  url: URL,
}

export default (props: Props) => {
  const { url } = props
  const [clicked, updateClicked] = useState(false)

  const instantPreview = getInstantPreview(url)

  if (!clicked) {
    return (
      <FetchedPreview
        url={url.toString()}
        onClick={() => {
          if (instantPreview) {
            updateClicked(true)
          } else {
            window.open(url, '_blank')
          }
        }}
      />
    )
  }
  if (instantPreview) {
    return <InstantPreview instantPreview={instantPreview}/>
  }
  return null
}
