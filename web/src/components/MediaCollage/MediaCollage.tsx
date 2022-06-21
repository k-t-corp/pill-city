import React, {useState} from "react";
import './MediaCollage.css'
import Lightbox from "react-image-lightbox";
import MediaUrlV2 from "../../models/MediaUrlV2";
import MediaV2 from "../MediaV2/MediaV2";
import getMediaV2Url from "../../utils/getMediaV2Url";

interface Props {
  mediaUrls: MediaUrlV2[]
  edgeless?: boolean
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

  const imgContainerClassName = props.edgeless ? 'media-collage-img-container-edgeless' : 'media-collage-img-container'

  if (mediaUrls.length === 1) {
    elements = [
      <div className={imgContainerClassName} key={0}>
        <MediaV2 className='media-collage-img' mediaUrlV2={mediaUrls[0]} onClick={e => {
          e.preventDefault()
          onClick(0)
        }}/>
      </div>
    ]
  }

  if (mediaUrls.length === 2) {
    elements = [
      <div className={imgContainerClassName} key={0}>
        <MediaV2 className='media-collage-img' mediaUrlV2={mediaUrls[0]} onClick={e => {
          e.preventDefault()
          onClick(0)
        }}/>
      </div>,
      <div className={imgContainerClassName} key={1}>
        <MediaV2 className='media-collage-img' mediaUrlV2={mediaUrls[1]} onClick={e => {
          e.preventDefault()
          onClick(1)
        }}/>
      </div>
    ]
  }

  if (mediaUrls.length === 3) {
    elements = [
      <div className={imgContainerClassName} key={0}>
        <MediaV2 className='media-collage-img' mediaUrlV2={mediaUrls[0]} onClick={e => {
          e.preventDefault()
          onClick(0)
        }}/>
      </div>,
      <div className='media-collage-img-col-container' key={1}>
        <div className={`${imgContainerClassName} media-collage-img-container-half`}>
          <MediaV2 className='media-collage-img media-collage-img-half' mediaUrlV2={mediaUrls[1]} onClick={e => {
            e.preventDefault()
            onClick(1)
          }}/>
        </div>
        <div className={`${imgContainerClassName} media-collage-img-container-half`}>
          <MediaV2 className='media-collage-img media-collage-img-half' mediaUrlV2={mediaUrls[2]} onClick={e => {
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
        <div className={`${imgContainerClassName} media-collage-img-container-half`}>
          <MediaV2 className='media-collage-img media-collage-img-half' mediaUrlV2={mediaUrls[0]} onClick={e => {
            e.preventDefault()
            onClick(0)
          }}/>
        </div>
        <div className={`${imgContainerClassName} media-collage-img-container-half`}>
          <MediaV2 className='media-collage-img media-collage-img-half' mediaUrlV2={mediaUrls[1]} onClick={e => {
            e.preventDefault()
            onClick(1)
          }}/>
        </div>
      </div>,
      <div className='media-collage-img-col-container' key={1}>
        <div className={`${imgContainerClassName} media-collage-img-container-half`}>
          <MediaV2 className='media-collage-img media-collage-img-half' mediaUrlV2={mediaUrls[2]} onClick={e => {
            e.preventDefault()
            onClick(2)
          }}/>
        </div>
        <div className={`${imgContainerClassName} media-collage-img-container-half`}>
          <MediaV2 className='media-collage-img media-collage-img-half' mediaUrlV2={mediaUrls[3]} onClick={e => {
            e.preventDefault()
            onClick(3)
          }}/>
        </div>
      </div>
    ]
  }

  return (
    <div
      className='media-collage'
      style={{
        marginTop: props.edgeless ? undefined : '10px',
        marginBottom: props.edgeless ? undefined : '10px',
      }}
    >
      {elements}
      {showingMediaIndex !== -1 &&
        <Lightbox
          mainSrc={getMediaV2Url(mediaUrls[showingMediaIndex])}
          prevSrc={showingMediaIndex !== 0 ? getMediaV2Url(mediaUrls[showingMediaIndex - 1]) : undefined}
          onMovePrevRequest={() =>
            updateShowingMediaIndex(showingMediaIndex - 1)
          }
          nextSrc={showingMediaIndex !== mediaUrls.length - 1 ? getMediaV2Url(mediaUrls[showingMediaIndex + 1]) : undefined}
          onMoveNextRequest={() =>
            updateShowingMediaIndex(showingMediaIndex + 1)
          }
          onCloseRequest={() => {updateShowingMediaIndex(-1)}}
          animationDuration={0}
          toolbarButtons={[
            <a
              href={mediaUrls[showingMediaIndex].original_url}
              target='_blank'
            >Original</a>
          ]}
        />
      }
    </div>
  )
}
