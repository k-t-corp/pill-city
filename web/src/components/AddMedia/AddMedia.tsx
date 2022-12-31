import React from "react";
import Media from "../../models/Media"
import UploadMedia from "./UploadMedia";
import './AddMedia.css'

interface Props {
  onChangeMedias: (arg0: FileList) => void
  onSelectOwnedMedia: (m: Media) => void
  onClose: () => void
}

export default (props: Props) => {
  return (
    <UploadMedia
      onChangeMedias={props.onChangeMedias}
      onClose={props.onClose}
    />
  )
}
