import React from "react";
import MediaUrlV2 from "../../models/MediaUrlV2";
import MediaV2 from "../MediaV2/MediaV2";
import getMediaV2Url from "../../utils/getMediaV2Url";
import 'photoswipe/dist/photoswipe.css'
import {Gallery, Item} from 'react-photoswipe-gallery'
import './MediaCollage.css'

interface Props {
  mediaUrls: MediaUrlV2[]
  edgeless?: boolean
}

export default (props: Props) => {
  const {mediaUrls} = props

  if (mediaUrls.length === 0) {
    return null
  }

  return (
    <Gallery withDownloadButton>
      <div
        style={{
          height: '309px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '150px 150px',
          gridGap: '4px 4px',
        }}
      >
        {mediaUrls.map(mu => {
          const imageUrl = getMediaV2Url(mu)

          return (
            <Item
              key={imageUrl}
              original={imageUrl}
              thumbnail={imageUrl}
              // width="400px"
              // height="100%"
            >
              {({ref, open}) => (
                <div ref={ref as React.Ref<HTMLDivElement>}>
                  <MediaV2 onClick={open} mediaUrlV2={mu} className='media-collage-item'/>
                </div>
              )}
            </Item>
          )
        })}
      </div>
    </Gallery>
  )
}
