import React from "react";
import MediaUrlV2, {ProcessedMedia} from "../../models/MediaUrlV2";
import { LazyImage } from 'react-lazy-images';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  mediaUrlV2: MediaUrlV2,
}

const MediaV2 = (props: Props) => {
  const {mediaUrlV2, ...imageProps} = props

  if (!props.mediaUrlV2.processed) {
    return (
      <LazyImage
        src={props.mediaUrlV2.original_url}
        // @ts-ignore
        placeholder={({ imageProps: placeHolderImageProps, ref}) => (
          <img
            {...imageProps}
            {...placeHolderImageProps}
            ref={ref}
            alt=""
            style={{
              backgroundColor: `#f0f0f0`
            }}
          />
        )}
        // @ts-ignore
        actual={({ imageProps: actualImageProps }) => (
          <img
            {...imageProps}
            {...actualImageProps}
            alt=""
          />
        )}
      />
    )
  }
  const processed = props.mediaUrlV2 as ProcessedMedia
  return (
    <LazyImage
      src={processed.processed_url}
      // @ts-ignore
      placeholder={({ imageProps: placeHolderImageProps, ref}) => (
        <img
          {...imageProps}
          {...placeHolderImageProps}
          ref={ref}
          alt=""
          style={{
            backgroundColor: `#${processed.dominant_color_hex}`
          }}
        />
      )}
      // @ts-ignore
      actual={({ imageProps: actualImageProps }) => (
        <img
          {...imageProps}
          {...actualImageProps}
          alt=""
        />
      )}
    />
  )
}

export default MediaV2
