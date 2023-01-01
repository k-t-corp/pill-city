import * as React from "react";
import InstantPreview, {getInstantPreview} from "./InstantPreview";
import FetchedPreview from "./FetchedPreview";
import './LinkPreview.css'
import {useState} from "react";
import LinkPreview from "../../models/LinkPreview";

interface Props {
  preview: LinkPreview,
}

const LinkPreviewComponent = (props: Props) => {
  const { preview } = props
  const [clicked, updateClicked] = useState(false)

  const instantPreview = getInstantPreview(preview.url)
  const fetchedPreview = (
    <FetchedPreview
      preview={preview}
      onClick={() => {
        updateClicked(true)
        if (!instantPreview) {
          window.open(preview.url, '_blank')
        }
      }}
    />
  )

  if (instantPreview) {
    if (!clicked) {
      return fetchedPreview
    } else {
      return <InstantPreview instantPreview={instantPreview}/>
    }
  }

  return fetchedPreview
}

export default LinkPreviewComponent
