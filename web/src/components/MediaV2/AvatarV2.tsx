import React from "react";
import User from "../../models/User";
import MediaV2 from "./MediaV2";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  user: User | null
}

const AvatarV2 = (props: Props) => {
  if (!props.user || !props.user.avatar_url_v2) {
    return (
      <img
        /*todo: remove user*/
        {...props}
        src={`${process.env.PUBLIC_URL}/assets/avatar.webp`}
        alt=""
      />
    )
  }
  return (
    <MediaV2
      {...props}
      mediaUrlV2={props.user.avatar_url_v2}
    />
  )
}

export default AvatarV2
