import React, {useState} from "react";
import OwnedMedia from "./OwnedMedia";
import Media from "../../models/Media"
import UploadMedia from "./UploadMedia";
import MyMediaSet from "./MyMediaSet";
import './AddMedia.css'

interface Props {
  onChangeMedias: (arg0: FileList) => void
  onSelectOwnedMedia: (m: Media) => void
  onClose: () => void
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
            selectMediaOp={'Use'}
            onSelectOwnedMedia={m => {
              props.onSelectOwnedMedia(m)
              props.onClose()
            }}
          />
        }
        {showingTab === 2 &&
          <MyMediaSet
            onSelectMedia={m => {
              props.onSelectOwnedMedia(m)
              props.onClose()
            }}
          />
        }
      </div>
    </>
  )
}
