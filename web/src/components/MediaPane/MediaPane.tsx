import React, {useState} from 'react';
import "./MediaPane.css"
import Lightbox from 'react-image-lightbox';

interface Props {
  mediaUrls: string[]
  mediaOperations?: {op: string, action: (index: number) => void}[]
  heightPx?: number
  usePlaceholder?: boolean
  oneRow?: boolean
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

  let mediaElems = []
  for (let i = 0; i < mediaCount; i++) {
    let mediaUrl
    let isPlaceholder = false
    if (i < props.mediaUrls.length) {
      mediaUrl = props.mediaUrls[i]
    } else {
      mediaUrl = `${process.env.PUBLIC_URL}/placeholder.png`
      isPlaceholder = true
    }
    mediaElems.push(
      <div
        className='media-img-container'
        style={{height, cursor: isPlaceholder ? 'auto' : 'pointer'}}
        key={i}
      >
        <img
          className='media-img'
          style={{height: !isPlaceholder && props.mediaOperations ? '86%' : '100%'}}
          src={mediaUrl}
          alt={""}
          onClick={e => {
            e.preventDefault()
            if (isPlaceholder) {
              return
            }
            updateShowingMediaIndex(i)
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

  const [showingMediaIndex, updateShowingMediaIndex] = useState(-1)
  const mediaUrls = props.mediaUrls

  return (
    <>
      <div className='media-pane'>
        {mediaElems}
      </div>
      {showingMediaIndex !== -1 &&
        <Lightbox
          mainSrc={mediaUrls[showingMediaIndex]}
          prevSrc={showingMediaIndex !== 0 ? mediaUrls[showingMediaIndex - 1] : undefined}
          onMovePrevRequest={() =>
            updateShowingMediaIndex(showingMediaIndex - 1)
          }
          nextSrc={showingMediaIndex !== mediaUrls.length - 1 ? mediaUrls[showingMediaIndex + 1] : undefined}
          onMoveNextRequest={() =>
            updateShowingMediaIndex(showingMediaIndex + 1)
          }
          onCloseRequest={() => {updateShowingMediaIndex(-1)}}
          animationDuration={0}
        />
      }
    </>
  )
}
