import React from "react";
import './NewPostMedia.css'

interface Props {
  onChangeMedias: (arg0: FileList) => void
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
