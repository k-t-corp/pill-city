import React, {useEffect, useRef, useState} from "react";
import Picker from "emoji-picker-react";
import {Reaction} from "../../models/Post";
import User from "../../models/User";
import './Reactions.css'
import RoundAvatar from "../RoundAvatar/RoundAvatar";
import ClickableId from "../ClickableId/ClickableId";
import MyModal from "../MyModal/MyModal";

const groupReactions = (reactions: Reaction[]) => {
  const groupedReactions: {[emoji: string]: {key: number, author: User, reactionId: string}[]} = {}
  for (let i = 0; i < reactions.length; i++) {
    let emoji = reactions[i].emoji
    let author = reactions[i].author
    let reactionId = reactions[i].id
    if (groupedReactions[emoji]) {
      groupedReactions[emoji].push({
        key: i,
        author: author,
        reactionId: reactionId
      })
    } else {
      groupedReactions[emoji] = [{
        key: i,
        author: author,
        reactionId: reactionId
      }]
    }
  }
  return groupedReactions
}

interface Props {
  reactions: Reaction[],
  me: User,
  api: any,
  postId: string
}

export default (props: Props) => {
  const [emojiPickerOpened, updateEmojiPickerOpened] = useState(false)
  const [detailNodalOpened, updateDetailNodalOpened] = useState(false)
  const [reactions, updateReactions] = useState<Reaction[]>(props.reactions)
  const [loading, updateLoading] = useState(false)
  const emojiPickerRef = useRef(null);

  const myReactionId = (emoji: string): string | undefined => {
    // Returns reaction id if I reacted with emoji, undefined otherwise
    const filteredReactions = reactions.filter(r => {
      return r.emoji === emoji && r.author.id === props.me.id
    })
    if (filteredReactions.length === 0) {
      return
    }
    return filteredReactions[0].id
  }

  const toggleEmoji = async (emoji: string) => {
    if (loading) {
      return
    }
    updateLoading(true)
    let reactionId = myReactionId(emoji)
    if (!reactionId) {
      // add reaction
      const res = await props.api.addReaction(emoji, props.postId)
      updateReactions([
        ...reactions,
        { id: res.id, emoji: emoji, author: props.me }
      ])
    } else {
      // delete reaction with reactionId
      await props.api.deleteReaction(props.postId, reactionId)
      updateReactions(reactions.filter(r => {
        return r.id !== reactionId
      }))
    }
    updateLoading(false)
  }

  const addEmoji = async (event: any, emojiObject: any) => {
    updateEmojiPickerOpened(false)
    if (loading) {
      return
    }
    updateLoading(true)
    const emoji = emojiObject.emoji
    const res = await props.api.addReaction(emoji, props.postId)
    updateReactions([
      ...reactions,
      { id: res.id, emoji: emoji, author: props.me }
    ])
    updateLoading(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (emojiPickerRef.current && !(emojiPickerRef.current as any).contains(event.target)) {
        updateEmojiPickerOpened(false)
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPickerRef]);

  const showEmojiPicker = () => {
    if (loading) {
      return
    }
    updateEmojiPickerOpened(true)
  }

  const showReactionsDetailModal = () => {
    if (loading) {
      return
    }
    updateDetailNodalOpened(true)
  }

  let addReactionClassName = "post-reaction"
  if (loading) {
    addReactionClassName += " post-reaction-loading"
  }

  let reactionElems = []

  for (const [emoji, reactionsWithEmoji] of Object.entries(groupReactions(reactions))) {
    if (reactionsWithEmoji.length === 0) {
      continue
    }
    let className = "post-reaction"
    if (loading) {
      className += " post-reaction-loading"
    } else if (myReactionId(emoji)) {
      className += " post-reaction-active"
    }
    reactionElems.push(
      <div className={className} key={emoji} onClick={() => toggleEmoji(emoji)}>
        <span className="post-emoji" role="img">{emoji}</span>
        {/*<span>&nbsp;{reactionsWithEmoji.length}</span>*/}
      </div>
    )
  }

  const totalReactions = reactions.length
  if (totalReactions !== 0) {
    reactionElems.push(
      <div key='reactions-detail'>
        <div className={addReactionClassName} onClick={showReactionsDetailModal}>
          <span aria-label="Reactions detail">{totalReactions}</span>
        </div>
      </div>
    )
  }

  reactionElems.push(
    <div key='add-reaction'>
      <div className={addReactionClassName} onClick={showEmojiPicker}>
        <span className="post-emoji" role="img" aria-label="Add Reaction">➕</span>
        {reactions.length === 0 ? "Add Reaction" : null}
      </div>
      {emojiPickerOpened &&
        <div id="post-reaction-emoji-picker-wrapper" ref={emojiPickerRef}>
          <div className="post-reaction-emoji-picker">
            <Picker onEmojiClick={addEmoji} preload={true} native={true}/>
          </div>
        </div>
      }
    </div>
  )

  const detailElems = []
  for (const [emoji, reactionsWithEmoji] of Object.entries(groupReactions(reactions))) {
    detailElems.push(
      <div
        key={emoji}
        className='post-reactions-detail-emoji'
      >{reactionsWithEmoji.length} {emoji}</div>
    )
    for (const r of reactionsWithEmoji) {
      detailElems.push(
        <div className="post-reactions-detail-author-wrapper">
          <div className="post-avatar post-reactions-detail-author-avatar">
            <RoundAvatar user={r.author}/>
          </div>
          <div className="post-reactions-detail-author">
            <ClickableId user={r.author}/>{' '}
          </div>
        </div>
      )
    }
  }

  return (
    <div className="post-reactions-wrapper">
      {reactionElems}
      <MyModal
        isOpen={detailNodalOpened}
        onClose={() => {updateDetailNodalOpened(false)}}
      >
        <div className='post-reactions-detail-header'>
          <div className='post-reactions-detail-title'>Reactions</div>
          <div
            className='post-reactions-detail-close-button'
            onClick={() => {updateDetailNodalOpened(false)}}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        {detailElems}
      </MyModal>
    </div>
  )
}
