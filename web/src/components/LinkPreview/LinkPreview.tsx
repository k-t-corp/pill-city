import * as React from "react";
import InstantPreview, {getInstantPreview} from "./InstantPreview";
import FetchedPreview from "./FetchedPreview";
import './LinkPreview.css'
import {useState} from "react";
import LinkPreview from "../../models/LinkPreview";

interface Props {
  preview: LinkPreview,
}

export default (props: Props) => {
  const { preview } = props
  const [clicked, updateClicked] = useState(false)

  const instantPreview = getInstantPreview(preview.url)

  if (!clicked) {
    return (
      <FetchedPreview
        preview={preview}
        onClick={() => {
          if (!instantPreview) {
            updateClicked(true)
          } else {
            window.open(preview.url, '_blank')
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
