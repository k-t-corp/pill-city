import React from 'react'
import {useHistory} from "react-router-dom";
import RoundAvatar from "../RoundAvatar/RoundAvatar";
import {ResharedPost} from "../../models/Post";
import './ResharedPost.css'
import ClickableId from "../ClickableId/ClickableId";
import MediaV2Collage from "../MediaV2Collage/MediaV2Collage";
import Poll from "../Poll/Poll";
import User from "../../models/User";
import FormattedContent from "../FormattedContent/FormattedContent";

interface Props {
  resharedFrom: ResharedPost,
  showDetail: boolean,
  me: User
}

const ResharedPostComponent = (props: Props) => {
  const { resharedFrom } = props

  const history = useHistory()

  return (
    <>
      <div className="post-reshared-wrapper" onClick={e => {
        e.preventDefault()
        history.push(`/post/${resharedFrom.id}`)
      }}>
        <div className="post-reshared-info">
          <div className="post-reshared-avatar">
            <RoundAvatar user={resharedFrom.author}/>
          </div>
          <div className="post-reshared-author">
            <ClickableId user={resharedFrom.author}/>
          </div>
        </div>
        <div className={`post-content ${props.showDetail ? '' : 'post-content-summary'}`}>
          {
            resharedFrom.state !== 'deleted' ?
              resharedFrom.formatted_content && <FormattedContent fc={resharedFrom.formatted_content}/> :
              <div style={{fontStyle: 'italic'}}>This post has been deleted</div>
          }
        </div>
      </div>
      <div className='post-reshared-attachments-wrapper'>
        {
          resharedFrom.state !== 'deleted' &&
          <MediaV2Collage mediaUrls={resharedFrom.media_urls_v2} />
        }
        {
          resharedFrom.state !== 'deleted' && resharedFrom.poll !== null &&
          <Poll poll={resharedFrom.poll} postId={resharedFrom.id} me={props.me} edgeless={true}/>
        }
      </div>
    </>
  )
}

export default ResharedPostComponent
