import React, {useState} from 'react';
import "./MediaPane.css"
import MyModal from "../MyModal/MyModal";

interface Props {
  mediaUrls: string[]
  mediaOperations?: {op: string, action: (index: number) => void}[]
  heightPx?: number
  usePlaceholder?: boolean
}

export default (props: Props) => {
  if (props.mediaUrls.length === 0 && !props.usePlaceholder) {
    return null
  }

  const height = props.heightPx ? `${props.heightPx}px` : '200px'
  let mediaCount = props.mediaUrls.length
  if (props.usePlaceholder && props.mediaUrls.length < 4) {
    mediaCount = 4
  }

  let mediaList = []
  for (let i = 0; i < mediaCount; i++) {
    let mediaUrl
    let isPlaceholder = false
    if (i < props.mediaUrls.length) {
      mediaUrl = props.mediaUrls[i]
    } else {
      mediaUrl = `${process.env.PUBLIC_URL}/placeholder.png`
      isPlaceholder = true
    }
    mediaList.push(
      <div
        className='media-pane'
        style={{height, cursor: isPlaceholder ? 'auto' : 'pointer'}}
        key={i}
      >
        <img
          className='media-pane-img'
          style={{height: !isPlaceholder && props.mediaOperations ? '86%' : '100%'}}
          src={mediaUrl}
          alt={""}
          onClick={e => {
            e.preventDefault()
            if (isPlaceholder) {
              return
            }
            updateModalMediaIndex(i)
          }}
        />
        {props.mediaOperations && !isPlaceholder &&
          <div className='media-op-container'>
            {props.mediaOperations.map(mo => {
              return (
                <div
                  className='media-op'
                  key={mo.op}
                  onClick={() => {mo.action(i)}}
                >
                  {mo.op}
                </div>
              )
            })}
          </div>
        }
      </div>
    )
  }

  const [modalMediaIndex, updateModalMediaIndex] = useState(-1)

  return (
    <>
      <div className='media-pane-container'>
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
