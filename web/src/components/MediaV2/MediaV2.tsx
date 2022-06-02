import React from "react";
import MediaUrlV2 from "../../models/MediaUrlV2";
import { LazyLoadImage } from 'react-lazy-load-image-component';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  mediaUrlV2: MediaUrlV2,
}

export default (props: Props) => {
  if (!props.mediaUrlV2.processed) {
    return (
      <img
        /*todo: remove mediaUrlV2*/
        {...props}
        src={props.mediaUrlV2.original_url}
        alt=""
      />
    )
  }
  return (
    // @ts-ignore
    <LazyLoadImage
      {...props}
      src={props.mediaUrlV2.processed_url}
      width={props.mediaUrlV2.width}
      height={props.mediaUrlV2.height}
      placeholder={(
        <span
          style={{
            backgroundColor: `#${props.mediaUrlV2.dominant_color_hex}`
          }}
        />
      )}
    />
  )
}
