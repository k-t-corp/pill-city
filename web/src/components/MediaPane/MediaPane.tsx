import React, {useState} from 'react';
import "./MediaPane.css"
import MyModal from "../MyModal/MyModal";

interface Props {
  mediaUrls: string[]
  onMediaClick?: (i: number) => void
  heightPx?: number
  usePlaceholder?: boolean
}

export default (props: Props) => {
  if (props.mediaUrls.length === 0) {
    return null
  }

  const height = props.heightPx ? `${props.heightPx}px` : '200px'
  let mediaCount = props.mediaUrls.length
  if (props.usePlaceholder && props.mediaUrls.length < 4) {
    mediaCount = 4
  }

  let mediaList = []
  for (let i = 0; i < mediaCount; i++) {
    let m
    let isPlaceholder = false
    if (i < props.mediaUrls.length) {
      m = props.mediaUrls[i]
    } else {
      m = `${process.env.PUBLIC_URL}/placeholder.png`
      isPlaceholder = true
    }
    mediaList.push(
      <div
        className='media-pane'
        style={{cursor: isPlaceholder ? 'auto' : 'pointer'}}
        key={i}
        onClick={e => {
          e.preventDefault()
          if (isPlaceholder) {
            return
          }
          if (props.onMediaClick) {
            props.onMediaClick(i)
          } else {
            updateModalMediaIndex(i)
          }
        }}
      >
        <img
          className='media-pane-img'
          src={m}
          alt={""}
        />
      </div>
    )
  }

  const [modalMediaIndex, updateModalMediaIndex] = useState(-1)

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
