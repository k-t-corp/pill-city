import React, {useState} from "react";
import OwnedMedia from "./OwnedMedia";
import Media from "../../models/Media"
import './AddMedia.css'
import UploadMedia from "./UploadMedia";
import MyMediaSet from "./MyMediaSet";

interface Props {
  onChangeMedias: (arg0: FileList) => void
  onSelectOwnedMedia: (m: Media) => void
  onClose: () => void
}

const myMediaSetOps = () => {
  return (
    <>
      <a href="#">Make my media set public</a>
      <a href="#">Delete my media set</a>
    </>
  )
}

export default (props: Props) => {
  const [showingTab, updateShowingTab] = useState(0)

  return (
    <>
      <div className='add-media-tabs'>
        <div
          className={'add-media-tab' + (showingTab === 0 ? ' add-media-tab-selected' : '')}
          onClick={() => {updateShowingTab(0)}}
        >Upload new media</div>
        <div
          className={'add-media-tab' + (showingTab === 1 ? ' add-media-tab-selected' : '')}
          onClick={() => {updateShowingTab(1)}}
        >Use uploaded media</div>
        <div
          className={'add-media-tab' + (showingTab === 2 ? ' add-media-tab-selected' : '')}
          onClick={() => {updateShowingTab(2)}}
        >My sticker pack</div>
        <div
          className={'add-media-tab' + (showingTab === 3 ? ' add-media-tab-selected' : '')}
          onClick={() => {updateShowingTab(3)}}
        >Public sticker packs</div>
      </div>
      <div>
        {showingTab === 0 &&
          <UploadMedia
            onChangeMedias={props.onChangeMedias}
            onClose={props.onClose}
          />
        }
        {showingTab === 1 &&
          <OwnedMedia
            onSelectOwnedMedia={m => {
              props.onSelectOwnedMedia(m)
              props.onClose()
            }}
          />
        }
        {
          showingTab === 2 &&
          <MyMediaSet
            onEmptyAddNewMedia={() => updateShowingTab(1)}
          />
        }
      </div>
    </>
  )
}
