import React from "react";
import MediaUrlV2 from "../../models/MediaUrlV2";
import MediaV2 from "../MediaV2/MediaV2";
import 'photoswipe/dist/photoswipe.css'
import {Gallery, Item} from 'react-photoswipe-gallery'
import './MediaV2Collage.css'
import PillCollage, {PillCollageChildFactory} from "../PillCollage/PillCollage";

interface Props {
  mediaUrls: MediaUrlV2[]
}

const MediaV2Collage = (props: Props) => {
  const {mediaUrls} = props

  if (mediaUrls.length === 0) {
    return null
  }

  return (
    <Gallery
      uiElements={[
        {
          name: 'download-button',
          ariaLabel: 'Download',
          order: 9,
          isButton: true,
          html: {
            isCustomSVG: true,
            inner: '<path d="M20.5 14.3 17.1 18V10h-2.2v7.9l-3.4-3.6L10 16l6 6.1 6-6.1ZM23 23H9v2h14Z" id="pswp__icn-download"/>',
            outlineID: 'pswp__icn-download-btn',
          },
          appendTo: 'bar',
          onClick: (e, el, pswpInstance) => {
            //@ts-ignore
            window.open(pswpInstance.currSlide.data.src, '_blank')
          },
        }
      ]}
      options={{
        loop: false,
        wheelToZoom: true
      }}
    >
      <PillCollage items={
        mediaUrls.map(mu => {
          let pswpItemProps: any = {
            original: mu.original_url
          }
          if (mu.processed) {
            pswpItemProps = {
              ...pswpItemProps,
              thumbnail: mu.processed_url,
              width: mu.width,
              height: mu.height
            }
          } else {
            pswpItemProps = {
              ...pswpItemProps,
              content: (
                <div className='media-v2-collage-pswp-content'>
                  <MediaV2 mediaUrlV2={mu} className='media-v2-collage-pswp-image'/>
                </div>
              )
            }
          }

          const el: PillCollageChildFactory = (properties) => {
            return (
              <Item
                key={mu.original_url}
                {...pswpItemProps}
              >
                {({ref, open}) => (
                  <div
                    style={properties}
                    ref={ref as React.Ref<HTMLDivElement>}
                  >
                    <MediaV2
                      onClick={open}
                      mediaUrlV2={mu}
                      className='media-v2-collage-item'
                      style={{
                        height: properties.itemHeight
                      }}
                    />
                  </div>
                )}
              </Item>
            )
          }

          return el
        })
      }/>
    </Gallery>
  )
}

export default MediaV2Collage
