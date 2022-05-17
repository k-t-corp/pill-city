import React, {useEffect, useRef, useState} from 'react'
import parseContent from "../../utils/parseContent";
import {pastTime} from "../../utils/timeDelta";
import {useHistory} from "react-router-dom";
import RoundAvatar from "../RoundAvatar/RoundAvatar";
import Reactions from "./Reactions";
import ResharedPost from "./ResharedPost";
import ClickableId from "../ClickableId/ClickableId";
import Comment from "./Comment";
import CommentBox from "./CommentBox";
import Post, {Comment as CommentModel, ResharedPost as ResharedPostModel, Poll} from "../../models/Post";
import User from "../../models/User";
import Previews from "./Previews";
import api from "../../api/Api";
import "./Post.css"
import {BanIcon, ChatIcon, DotsVerticalIcon, ShareIcon} from "@heroicons/react/solid";
import PillDropdownMenu from "../PillDropdownMenu/PillDropdownMenu";
import MediaPane from "../MediaPane/MediaPane";

interface Props {
  data: Post
  highlightCommentId?: string
  me: User
  detail: boolean
  hasNewPostModal: boolean,
  updateNewPostOpened: (arg0: boolean) => void
  updateResharePostData: (arg0: Post | ResharedPostModel | null) => void
  disableNavigateToPostPage?: true
}

export default (props: Props) => {
  const [deleted, updateDeleted] = useState(props.data.deleted)
  const [deleting, updateDeleting] = useState(false)
  const [commentContent, updateCommentContent] = useState('')

  // existing comment data cached in state
  const [comments, updateComments] = useState(props.data.comments)
  // whether the comment box is expanded
  const [addingComment, updateAddingComment] = useState(false)
  // currently replying to comment
  const [replyingToComment, updateReplyingToComment] = useState<CommentModel | null>(null)

  const [mediaUrls, updateMediaUrls] = useState(props.data.media_urls)
  const [poll, updatePoll] = useState<Poll>(props.data.poll)
  const [voting, updateVoting] = useState(false)

  const history = useHistory()

  const highlightCommentId = props.highlightCommentId
  const highlightCommentRef = useRef(null)
  useEffect(() => {
    if (highlightCommentId && highlightCommentRef) {
      (highlightCommentRef as any).current.scrollIntoView({behavior: 'smooth'})
    }
  }, [highlightCommentRef])

  let commentElems = []
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i]

    commentElems.push(
      <Comment
        key={comment.id}
        me={props.me}
        comment={comment}
        post={props.data}
        detail={props.detail}
        highlightCommentId={highlightCommentId}
        highlightCommentRef={highlightCommentRef}
        onReply={() => {
          updateAddingComment(true)
          updateReplyingToComment(comment)
        }}
        onNestedCommentReply={(nestedComment) => {
          updateAddingComment(true)
          updateReplyingToComment(comment)
          updateCommentContent(`@${nestedComment.author.id} `)
        }}
      />
    )
  }

  const deletePost = async () => {
    if (deleting) {
      return
    }
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return
    }
    updateDeleting(true)
    await api.deletePost(props.data.id)
    updateDeleted(true)
    updateDeleting(false)
  }

  const deletePostMedia = async () => {
    if (mediaUrls.length === 0) {
      return
    }
    if (!window.confirm('Are you sure you want to delete all media of this post?')) {
      return
    }
    updateMediaUrls([])
    await api.deletePostMedia(props.data.id)
  }

  const reshareButtonOnClick = () => {
    if (props.hasNewPostModal) {
      props.updateNewPostOpened(true)
    }
    if (props.data.reshared_from === null) {
      props.updateResharePostData(props.data)
    } else {
      props.updateResharePostData(props.data.reshared_from)
    }
  }

  let sharingScope
  if (props.data.is_public) {
    sharingScope = 'Public'
  } else if (props.data.circles.length !== 0) {
    sharingScope = props.data.circles.filter(_ => _).map(c => c.name).join(', ')
  } else {
    sharingScope = 'Only you'
  }

  const disableNavigateToPostPage = props.disableNavigateToPostPage === true
  const navigateToPostPage = (e: any) => {
    e.preventDefault();
    if (!disableNavigateToPostPage) {
      history.push(`/post/${props.data.id}`)
    }
  }

  const commentButtonOnClick = () => {
    updateAddingComment(!addingComment)
    updateReplyingToComment(null)
  }

  return (
    <div className="post-wrapper">
      <div className="post-op">
        <div className="post-op-info-wrapper">
          <div className="post-op-info-left">
            <div className="post-avatar">
              <RoundAvatar user={props.data.author}/>
            </div>
            <div className="post-name">
              <ClickableId user={props.data.author}/>
            </div>
            <div className="post-visibility">
              &#x25B8; {sharingScope}
            </div>
          </div>
          <div>
            <div className="post-op-info-time" onClick={navigateToPostPage} style={{
              cursor: disableNavigateToPostPage ? 'auto' : 'pointer'
            }}>
              {pastTime(props.data.created_at_seconds)}
            </div>
            {
              props.me.id === props.data.author.id && !deleted &&
              <PillDropdownMenu
                items={
                  mediaUrls.length > 0 && props.data.content ? [
                    {
                      text: 'Delete all media',
                      onClick: deletePostMedia
                    },
                    {
                      text: 'Delete post',
                      onClick: deletePost
                    }
                  ] : [
                    {
                      text: 'Delete post',
                      onClick: deletePost
                    }
                  ]
                }
              >
                <div className="post-more-actions-trigger">
                  <DotsVerticalIcon />
                </div>
              </PillDropdownMenu>
            }
          </div>
        </div>
        <div className='post-content-wrapper'>
          {
            !deleted ?
              !props.data.is_update_avatar ?
                parseContent(props.data.content, `post-content ${props.detail ? '' : 'post-content-summary'}`)
                :
                <div className='post-content' style={{fontStyle: 'italic'}}>@{props.data.author.id} has a new
                  avatar!</div>
              :
              <div className='post-content' style={{fontStyle: 'italic'}}>This post has been deleted</div>
          }
        </div>
        {props.data.reshared_from &&
        <ResharedPost
          resharedFrom={props.data.reshared_from}
          showDetail={props.detail}
        />
        }
        {!deleting && !deleted &&
          <MediaPane mediaUrls={mediaUrls} heightPx={300}/>
        }
        {!deleting && !deleted &&
          <Previews post={props.data}/>
        }
        {poll.choices && poll.choices.length > 0 &&
          <div className='post-poll'>
            {poll.choices.map((c, i) => {
              // whether me has voted for this choice
              const voted = c.voters.map(u => u.id).indexOf(props.me.id) !== -1

              const votes = c.voters.length
              const totalVotes = poll.choices.map(c => c.voters).reduce((prev, cur) => [...prev, ...cur]).length
              let percent = 0
              if (totalVotes !== 0) {
                percent = votes / totalVotes
              }

              return (
                <div
                  key={i}
                  className='post-poll-choice'
                  style={{
                    cursor: voting ? 'auto' : 'pointer',
                    backgroundColor: voting ? '#ffffff' : voted ? '#E05140' : '#f0f0f0',
                    color: voting ? '#000000' : voted ? '#ffffff' : '#000000'
                  }}
                  onClick={async (e) => {
                    e.preventDefault()
                    if (voting) {
                      return
                    }
                    updateVoting(true)
                    await api.vote(props.data.id, c.id)

                    updatePoll({...poll, choices: poll.choices.map(cc => {
                      if (cc.voters.map(u => u.id).filter(id => id === props.me.id).length > 0) {
                        // if the user previously picked this choice
                        return {
                          ...cc, voters: cc.voters.filter(u => u.id !== props.me.id)
                        }
                      } else if (c.id === cc.id) {
                        // if the user now picks this choice
                        return {
                          ...cc, voters: [...cc.voters, props.me]
                        }
                      } else {
                        return cc
                      }
                    })})
                    updateVoting(false)
                  }}
                >{`${c.content} (${(percent * 100).toFixed()}%, ${votes} votes)`}</div>
              )
            })}
          </div>
        }
        {
          !deleting && !deleted &&
          <div className="post-interactions-wrapper">
            <Reactions
              reactions={props.data.reactions}
              me={props.me}
              postId={props.data.id}
            />
            <div className="post-interactions">
              <div className="post-circle-button" onClick={commentButtonOnClick}>
                <ChatIcon />
              </div>
              {props.data.reshareable ?
                <div className="post-circle-button" onClick={reshareButtonOnClick}>
                  <ShareIcon />
                </div>
                :
                <div className="post-circle-button">
                  <BanIcon />
                </div>
              }
            </div>
          </div>
        }
        {addingComment && <CommentBox
          me={props.me}
          post={props.data}
          content={commentContent}
          updateContent={updateCommentContent}
          replyingToComment={replyingToComment}
          addComment={(newComment) => {
            updateComments([...comments, newComment])
          }}
          addNestedComment={(newNestedComment) => {
            updateComments(comments.map(c => {
              if (replyingToComment && c.id !== replyingToComment.id) {
                return c
              }
              return {
                ...c,
                comments: [...c.comments, newNestedComment]
              }
            }))
          }}
          afterSendingComment={() => {
            updateAddingComment(false)
            updateReplyingToComment(null)
          }}
        />}
      </div>
      {comments.length === 0 ? null :
        <div className="post-comments-wrapper">
          {commentElems}
        </div>
      }
    </div>
  )
}


