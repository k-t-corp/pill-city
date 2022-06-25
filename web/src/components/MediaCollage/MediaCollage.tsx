import React from "react";
import MediaUrlV2 from "../../models/MediaUrlV2";
import MediaV2 from "../MediaV2/MediaV2";
import 'photoswipe/dist/photoswipe.css'
import {Gallery, Item} from 'react-photoswipe-gallery'
import './MediaCollage.css'

interface Props {
  mediaUrls: MediaUrlV2[]
}

export default (props: Props) => {
  const {mediaUrls} = props

  if (mediaUrls.length === 0) {
    return null
  }

  return (
    <Gallery
      withDownloadButton
      options={{
        loop: false
      }}
    >
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
          return (
            <Item
              key={mu.original_url}
              content={
                <MediaV2 mediaUrlV2={mu} className='media-collage-pswp-content'/>
              }
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
