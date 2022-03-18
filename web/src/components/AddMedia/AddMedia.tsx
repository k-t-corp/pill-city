import React, {useState} from "react";
import OwnedMedia from "../OwnedMedia/OwnedMedia";
import Media from "../../models/Media"
import './AddMedia.css'

interface Props {
  onChangeMedias: (arg0: FileList) => void
  onSelectOwnedMedia: (m: Media) => void
  onClose: () => void
}

export default (props: Props) => {
  const [showingTab, updateShowingTab] = useState(0)

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
      <div className='add-media-tabs'>
        <div
          className={'add-media-tab' + (showingTab === 0 ? ' add-media-tab-selected' : '')}
          onClick={() => {updateShowingTab(0)}}
        >Upload new image</div>
        <div
          className={'add-media-tab' + (showingTab === 1 ? ' add-media-tab-selected' : '')}
          onClick={() => {updateShowingTab(1)}}
        >Use uploaded images</div>
        <div
          className={'add-media-tab' + (showingTab === 2 ? ' add-media-tab-selected' : '')}
          onClick={() => {updateShowingTab(2)}}
        >My media set</div>
        <div
          className={'add-media-tab' + (showingTab === 3 ? ' add-media-tab-selected' : '')}
          onClick={() => {updateShowingTab(3)}}
        >Public media sets</div>
      </div>
      <div>
        {showingTab === 0 &&
          <>
            <label
              htmlFor='upload'
              className='add-media-drop-zone'
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
        }
        {showingTab == 1 &&
          <OwnedMedia onSelectOwnedMedia={m => {
            props.onSelectOwnedMedia(m)
            props.onClose()
          }}/>
        }
      </div>
    </>
  )
}
