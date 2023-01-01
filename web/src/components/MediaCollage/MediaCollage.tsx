import React from "react";
import MediaUrlV2 from "../../models/MediaUrlV2";
import MediaV2 from "../MediaV2/MediaV2";
import 'photoswipe/dist/photoswipe.css'
import {Gallery, Item} from 'react-photoswipe-gallery'
import './MediaCollage.css'

interface Props {
  mediaUrls: MediaUrlV2[]
}

const MediaCollage = (props: Props) => {
  const {mediaUrls} = props

  if (mediaUrls.length === 0) {
    return null
  }

  let mediaUrlWithCssGridProperties: {
    gridColumnStart: number,
    gridColumnEnd: number,
    gridRowStart: number,
    gridRowEnd: number,
    itemHeight: string,
    mediaUrl: MediaUrlV2
  }[]

  if (mediaUrls.length === 1) {
    mediaUrlWithCssGridProperties = [
      {
        mediaUrl: mediaUrls[0],
        gridColumnStart: 1,
        gridColumnEnd: 3,
        gridRowStart: 1,
        gridRowEnd: 3,
        itemHeight: '309px'
      }
    ]
  } else if (mediaUrls.length === 2) {
    mediaUrlWithCssGridProperties = [
      {
        mediaUrl: mediaUrls[0],
        gridColumnStart: 1,
        gridColumnEnd: 2,
        gridRowStart: 1,
        gridRowEnd: 3,
        itemHeight: '309px'
      },
      {
        mediaUrl: mediaUrls[1],
        gridColumnStart: 2,
        gridColumnEnd: 3,
        gridRowStart: 1,
        gridRowEnd: 3,
        itemHeight: '309px'
      }
    ]
  } else if (mediaUrls.length === 3) {
    mediaUrlWithCssGridProperties = [
      {
        mediaUrl: mediaUrls[0],
        gridColumnStart: 1,
        gridColumnEnd: 2,
        gridRowStart: 1,
        gridRowEnd: 3,
        itemHeight: '309px'
      },
      {
        mediaUrl: mediaUrls[1],
        gridColumnStart: 2,
        gridColumnEnd: 3,
        gridRowStart: 1,
        gridRowEnd: 2,
        itemHeight: '150px'
      },
      {
        mediaUrl: mediaUrls[2],
        gridColumnStart: 2,
        gridColumnEnd: 3,
        gridRowStart: 2,
        gridRowEnd: 3,
        itemHeight: '150px'
      }
    ]
  } else {
    mediaUrlWithCssGridProperties = [
      {
        mediaUrl: mediaUrls[0],
        gridColumnStart: 1,
        gridColumnEnd: 2,
        gridRowStart: 1,
        gridRowEnd: 2,
        itemHeight: '150px'
      },
      {
        mediaUrl: mediaUrls[1],
        gridColumnStart: 2,
        gridColumnEnd: 3,
        gridRowStart: 1,
        gridRowEnd: 2,
        itemHeight: '150px'
      },
      {
        mediaUrl: mediaUrls[2],
        gridColumnStart: 1,
        gridColumnEnd: 2,
        gridRowStart: 2,
        gridRowEnd: 3,
        itemHeight: '150px'
      },
      {
        mediaUrl: mediaUrls[3],
        gridColumnStart: 2,
        gridColumnEnd: 3,
        gridRowStart: 2,
        gridRowEnd: 3,
        itemHeight: '150px'
      }
    ]
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
      <div
        style={{
          height: '309px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '150px 150px',
          gridGap: '4px 4px',
        }}
      >
        {mediaUrlWithCssGridProperties.map(m => {
          const {mediaUrl: mu} = m
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
                <div className='media-collage-pswp-content'>
                  <MediaV2 mediaUrlV2={mu} className='media-collage-pswp-image'/>
                </div>
              )
            }
          }

          return (
            <Item
              key={mu.original_url}
              {...pswpItemProps}
            >
              {({ref, open}) => (
                <div
                  ref={ref as React.Ref<HTMLDivElement>}
                  style={{
                    gridColumnStart: m.gridColumnStart,
                    gridColumnEnd: m.gridColumnEnd,
                    gridRowStart: m.gridRowStart,
                    gridRowEnd: m.gridRowEnd,
                  }}
                >
                  <MediaV2
                    onClick={open}
                    mediaUrlV2={mu}
                    className='media-collage-item'
                    style={{
                      height: m.itemHeight
                    }}
                  />
                </div>
              )}
            </Item>
          )
        })}
      </div>
    </Gallery>
  )
}

export default MediaCollage
