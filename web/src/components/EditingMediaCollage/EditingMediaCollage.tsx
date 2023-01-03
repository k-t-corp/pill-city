import React, {useState} from "react";
import PillCollage, {PillCollageChildFactory} from "../PillCollage/PillCollage";
import './EditingMediaCollage.css'
import {ChevronLeftIcon, ChevronRightIcon, TrashIcon} from "@heroicons/react/solid";
import Lightbox from 'react-image-lightbox';

interface Props {
  mediaUrls: string[]
  onMoveLeft(index: number): void
  onMoveRight(index: number): void
  onDelete(index: number): void
}

const EditingMediaCollage = (props: Props) => {
  const {mediaUrls} = props
  const [showingMediaIndex, updateShowingMediaIndex] = useState(-1)

  if (mediaUrls.length === 0) {
    return null
  }

  return (
    <>
      <PillCollage
        containerClassName='editing-media-collage'
        items={
          mediaUrls.map((mu, i) => {
            const el: PillCollageChildFactory = (properties) => {
              return (
                <div
                  key={mu}
                  className='editing-media-collage-img-container'
                  style={properties}
                >
                  <img
                    className='editing-media-collage-img'
                    style={{
                      height: properties.itemHeight
                    }}
                    src={mu}
                    alt=''
                    onClick={e => {
                      e.preventDefault()
                      updateShowingMediaIndex(i)
                    }}
                  />
                  <div className='editing-media-collage-img-index'>
                    {i + 1}
                  </div>
                  <div className='editing-media-collage-img-ops'>
                    <div className='editing-media-collage-img-op' onClick={e => {
                      e.preventDefault()
                      props.onMoveLeft(i)
                    }}>
                      <ChevronLeftIcon />
                    </div>
                    <div className='editing-media-collage-img-op' onClick={e => {
                      e.preventDefault()
                      props.onDelete(i)
                    }}>
                      <TrashIcon />
                    </div>
                    <div className='editing-media-collage-img-op' onClick={e => {
                      e.preventDefault()
                      props.onMoveRight(i)
                    }}>
                      <ChevronRightIcon />
                    </div>
                  </div>
                </div>
              )
            }
            return el
          })
        }
      />
      {showingMediaIndex >= 0 &&
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
          animationDuration={200}
        />
      }
    </>
  )
}

export default EditingMediaCollage;
