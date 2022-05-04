import React, {useState} from 'react';
import "./MediaPane.css"
import MyModal from "../MyModal/MyModal";

interface Props {
  mediaUrls: string[]
  onMediaClick?: (i: number) => void
  heightPx?: number
}

export default (props: Props) => {
  const mediaCount = props.mediaUrls.length
  if (mediaCount === 0) {
    return null
  }
  const [modalMediaIndex, updateModalMediaIndex] = useState(-1)
  const height = props.heightPx ? `${props.heightPx}px` : '300px'

  let mediaList = []
  for (let i = 0; i < mediaCount; i++) {
    const mediaUrl = props.mediaUrls[i]
    mediaList.push(
      <div
        className='media-pane'
        key={i}
        onClick={e => {
          e.preventDefault()
          if (props.onMediaClick) {
            props.onMediaClick(i)
          } else {
            updateModalMediaIndex(i)
          }
        }}
      >
        <img
          className='media-pane-img'
          src={mediaUrl}
          alt={""}
        />
      </div>
    )
  }

  return (
    <>
      <div
        className='media-pane-container'
        style={{height}}
      >
        {mediaList}
      </div>
      <MyModal
        isOpen={modalMediaIndex !== -1}
        onClose={() => {
          updateModalMediaIndex(-1)
        }}
      >
        <div className='media-modal-container'>
          <img
            className='media-modal-img'
            src={props.mediaUrls[modalMediaIndex]}
            alt={""}
          />
        </div>
      </MyModal>
    </>
  )
}
