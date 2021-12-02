import React, {useEffect, useRef, useState} from "react";
import Picker from "emoji-picker-react";
import {Reaction} from "../../models/Post";
import User from "../../models/User";
import './Reactions.css'

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
  const [showEmojiPicker, updateShowEmojiPicker] = useState(false)
  const [reactions, updateReactions] = useState<Reaction[]>(props.reactions)
  const [reactionLoading, updateReactionLoading] = useState(false)
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
    if (reactionLoading) {
      return
    }
    updateReactionLoading(true)
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
    updateReactionLoading(false)
  }

  const addEmoji = async (event: any, emojiObject: any) => {
    updateShowEmojiPicker(false)
    if (reactionLoading) {
      return
    }
    updateReactionLoading(true)
    const emoji = emojiObject.emoji
    const res = await props.api.addReaction(emoji, props.postId)
    updateReactions([
      ...reactions,
      { id: res.id, emoji: emoji, author: props.me }
    ])
    updateReactionLoading(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (emojiPickerRef.current && !(emojiPickerRef.current as any).contains(event.target)) {
        updateShowEmojiPicker(false)
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPickerRef]);

  const _showEmojiPicker = () => {
    if (reactionLoading) {
      return
    }
    updateShowEmojiPicker(true)
  }

  let reactionElems = []
  for (const [emoji, reactionsWithEmoji] of Object.entries(groupReactions(reactions))) {
    if (reactionsWithEmoji.length === 0) {
      continue
    }
    let className = "post-reaction"
    if (reactionLoading) {
      className += " post-reaction-loading"
    } else if (myReactionId(emoji)) {
      className += " post-reaction-active"
    }
    reactionElems.push(
      <div className={className} key={emoji} onClick={() => toggleEmoji(emoji)}>
        <span className="post-emoji" role="img">{emoji}</span>
        <span>&nbsp;{reactionsWithEmoji.length}</span>
      </div>
    )
  }

  let addReactionClassName = "post-reaction"
  if (reactionLoading) {
    addReactionClassName += " post-reaction-loading"
  }
  reactionElems.push(
    <div key={'add-reaction'}>
      <div className={addReactionClassName} onClick={_showEmojiPicker}>
        <span className="post-emoji" role="img" aria-label="Add Reaction">➕</span>
        {reactions.length === 0 ? "Add Reaction" : null}
      </div>
      {showEmojiPicker &&
        <div id="post-reaction-emoji-picker-wrapper" ref={emojiPickerRef}>
          <div className="post-reaction-emoji-picker">
            <Picker onEmojiClick={addEmoji} preload={true} native={true}/>
          </div>
        </div>
      }
    </div>
  )
  return reactionElems
}
