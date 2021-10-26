import React from 'react'
import {useHistory} from "react-router-dom";
import {useMediaQuery} from "react-responsive";
import RoundAvatar from "../RoundAvatar/RoundAvatar";
import parseContent from "../../utils/parseContent";
import MediaPreview from "../MediaPreview/MediaPreview";
import {ResharedPost} from "../../models/Post";
import './ResharedPost.css'
import LinkPreview from "../LinkPreview/LinkPreview";

interface Props {
  resharedFrom: ResharedPost,
  showDetail: boolean,
  api: any
}

export default (props: Props) => {
  const { resharedFrom } = props

  const history = useHistory()
  const isTabletOrMobile = useMediaQuery({query: '(max-width: 750px)'})

  return (
    <div className="post-reshared-wrapper" onClick={e => {
      e.preventDefault()
      history.push(`/post/${resharedFrom.id}`)
    }}>
      <div className="post-reshared-info">
        <div className="post-avatar post-reshared-avatar">
          <RoundAvatar user={resharedFrom.author}/>
        </div>
        <div className="post-reshared-author">
          {resharedFrom.author.id}
        </div>
      </div>
      <div className={`post-content ${props.showDetail ? '' : 'post-content-summary'}`}>
        {
          !resharedFrom.deleted ?
            parseContent(resharedFrom.content, "")
            :
            <div style={{fontStyle: 'italic'}}>This post has been deleted</div>
        }
        {
          !resharedFrom.deleted && resharedFrom.media_urls.length !== 0 &&
            <MediaPreview
              mediaUrls={resharedFrom.media_urls}
              threeRowHeight="80px"
              twoRowHeight={isTabletOrMobile ? "100px" : "140px"}
              oneRowHeight={isTabletOrMobile ? "140px" : "240px"}
            />
        }
        {
          !resharedFrom.deleted &&
            <LinkPreview post={resharedFrom} api={props.api}/>
        }
      </div>
    </div>
  )
}
