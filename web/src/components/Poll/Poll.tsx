import React, {useState} from "react"
import {Poll} from "../../models/Post";
import api from "../../api/Api";
import User from "../../models/User";
import './Poll.css'

interface Props {
  poll: Poll
  postId: string
  me: User
  edgeless?: boolean
}

export default (props: Props) => {
  if (!props.poll.choices || props.poll.choices.length === 0) {
    return null
  }

  const [poll, updatePoll] = useState<Poll>(props.poll)
  const [voting, updateVoting] = useState(false)

  return (
    <div style={{
      marginBottom: props.edgeless ? undefined : '15px'
    }}>
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
              color: voting ? '#000000' : voted ? '#ffffff' : '#000000',
              marginBottom: props.edgeless ? undefined : '0.5em'
            }}
            onClick={async (e) => {
              e.preventDefault()
              if (voting) {
                return
              }
              updateVoting(true)
              await api.vote(props.postId, c.id)

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
  )
}
