import React from "react";
import OwnedMedia from "../OwnedMedia/OwnedMedia";
import Media from "../../models/Media"
import './AddMedia.css'

interface Props {
  onChangeMedias: (arg0: FileList) => void
  onSelectOwnedMedia: (m: Media) => void
  onClose: () => void
}

export default (props: Props) => {
  const onDrop = (e: any) => {
    e.preventDefault()
    props.onChangeMedias(e.dataTransfer.files)
    props.onClose()
  }

  const onChange = (e: any) => {
    e.preventDefault()
    props.onChangeMedias(e.target.files)
    props.onClose()
  }

  return (
    <>
      <OwnedMedia onSelectOwnedMedia={m => {
        props.onSelectOwnedMedia(m)
        props.onClose()
      }}/>
      <div className='new-post-media-divider'>OR</div>
      <label
        htmlFor='upload'
        className='new-post-media-drop-zone'
        onDragOver={(e: any) => {e.preventDefault()}}
        onDragEnter={(e: any) => {e.preventDefault()}}
        onDragLeave={(e: any) => {e.preventDefault()}}
        onDrop={onDrop}
      >
        Drop or click here to upload media
      </label>
      <input
        id='upload'
        accept="image/*"
        type="file"
        onChange={onChange}
        multiple={true}
      />
    </>
  )
}
