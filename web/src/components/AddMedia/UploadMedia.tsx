import React from 'react'
import './UploadMedia.css'

interface Props {
  onChangeMedias: (fl: FileList) => void
  onClose: () => void
}

const UploadMedia = (props: Props) => {
  const onDrop = (e: React.DragEvent) => {
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
        className='upload-media-drop-zone'
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

export default UploadMedia
