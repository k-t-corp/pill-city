import React from "react";
import PillCollage, {PillCollageChildFactory} from "../PillCollage/PillCollage";
import './EditingMediaCollage.css'

interface Props {
  mediaUrls: string[]
}

const EditingMediaCollage = (props: Props) => {
  const {mediaUrls} = props

  if (mediaUrls.length === 0) {
    return null
  }

  return (
    <PillCollage
      containerClassName='editing-media-collage'
      items={
        mediaUrls.map(mu => {
          const el: PillCollageChildFactory = (properties) => {
            return (
              <div
                style={properties}
              >
                <img
                  className='editing-media-collage-img'
                  style={{
                    height: properties.itemHeight
                  }}
                  src={mu} alt=''
                />
              </div>
            )
          }
          return el
        })
      }
    />
  )
}

export default EditingMediaCollage
