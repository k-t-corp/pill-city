import React from 'react'
import {useHistory} from "react-router-dom";
import RoundAvatar from "../RoundAvatar/RoundAvatar";
import parseContent from "../../utils/parseContent";
import {ResharedPost} from "../../models/Post";
import './ResharedPost.css'
import Previews from "./Previews";
import ClickableId from "../ClickableId/ClickableId";

interface Props {
  resharedFrom: ResharedPost,
  showDetail: boolean,
  api: any,
}

export default (props: Props) => {
  const { resharedFrom } = props

  const history = useHistory()

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
          <ClickableId user={resharedFrom.author}/>
        </div>
      </div>
      <div className={`post-content ${props.showDetail ? '' : 'post-content-summary'}`}>
        {
          !resharedFrom.deleted ?
            parseContent(resharedFrom.content, "")
            :
            <div style={{fontStyle: 'italic'}}>This post has been deleted</div>
        }
        <Previews post={props.resharedFrom} api={props.api}/>
      </div>
    </div>
  )
}
