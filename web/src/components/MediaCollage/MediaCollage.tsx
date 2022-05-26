import React, {useState} from "react";
import './MediaCollage.css'
import Lightbox from "react-image-lightbox";

interface Props {
  mediaUrls: string[]
}

export default (props: Props) => {
  const {mediaUrls} = props

  if (mediaUrls.length === 0) {
    return null
  }

  const [showingMediaIndex, updateShowingMediaIndex] = useState(-1)
  let elements: JSX.Element[] = []

  const onClick = (i: number) => {
    updateShowingMediaIndex(i)
  }

  if (mediaUrls.length === 1) {
    elements = [
      <div className='media-collage-img-container' key={0}>
        <img className='media-collage-img' src={mediaUrls[0]} alt="" onClick={e => {
          e.preventDefault()
          onClick(0)
        }}/>
      </div>
    ]
  }

  if (mediaUrls.length === 2) {
    elements = [
      <div className='media-collage-img-container' key={0}>
        <img className='media-collage-img' src={mediaUrls[0]} alt="" onClick={e => {
          e.preventDefault()
          onClick(0)
        }}/>
      </div>,
      <div className='media-collage-img-container' key={1}>
        <img className='media-collage-img' src={mediaUrls[1]} alt="" onClick={e => {
          e.preventDefault()
          onClick(1)
        }}/>
      </div>
    ]
  }

  if (mediaUrls.length === 3) {
    elements = [
      <div className='media-collage-img-container' key={0}>
        <img className='media-collage-img' src={mediaUrls[0]} alt="" onClick={e => {
          e.preventDefault()
          onClick(0)
        }}/>
      </div>,
      <div className='media-collage-img-col-container' key={1}>
        <div className='media-collage-img-container media-collage-img-container-half'>
          <img className='media-collage-img media-collage-img-half' src={mediaUrls[1]} alt="" onClick={e => {
            e.preventDefault()
            onClick(1)
          }}/>
        </div>
        <div className='media-collage-img-container media-collage-img-container-half'>
          <img className='media-collage-img media-collage-img-half' src={mediaUrls[2]} alt="" onClick={e => {
            e.preventDefault()
            onClick(2)
          }}/>
        </div>
      </div>
    ]
  }

  if (mediaUrls.length === 4) {
    elements = [
      <div className='media-collage-img-col-container' key={0}>
        <div className='media-collage-img-container media-collage-img-container-half'>
          <img className='media-collage-img media-collage-img-half' src={mediaUrls[0]} alt="" onClick={e => {
            e.preventDefault()
            onClick(0)
          }}/>
        </div>
        <div className='media-collage-img-container media-collage-img-container-half'>
          <img className='media-collage-img media-collage-img-half' src={mediaUrls[1]} alt="" onClick={e => {
            e.preventDefault()
            onClick(1)
          }}/>
        </div>
      </div>,
      <div className='media-collage-img-col-container' key={1}>
        <div className='media-collage-img-container media-collage-img-container-half'>
          <img className='media-collage-img media-collage-img-half' src={mediaUrls[2]} alt="" onClick={e => {
            e.preventDefault()
            onClick(2)
          }}/>
        </div>
        <div className='media-collage-img-container media-collage-img-container-half'>
          <img className='media-collage-img media-collage-img-half' src={mediaUrls[3]} alt="" onClick={e => {
            e.preventDefault()
            onClick(3)
          }}/>
        </div>
      </div>
    ]
  }

  return (
    <div className='media-collage'>
      {elements}
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
    </div>
  )
}
