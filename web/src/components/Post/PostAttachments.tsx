import React, {useState} from "react"
import './PostAttachments.css'
import PillModal from "../PillModal/PillModal";

export interface PostAttachment {
  el: JSX.Element
}

interface Props {
  attachments: PostAttachment[]
}

export default (props: Props) => {
  const {attachments} = props

  if (attachments.length === 0) {
    return null
  }

  if (attachments.length === 1) {
    return attachments[0].el
  }

  const [showMoreModalOpened, updateShowMoreModalOpened] = useState(false)
  let title
  if (attachments.length === 2) {
    title = "1 more post attachment"
  } else {
    title = `${attachments.length - 1} more post attachments`
  }

  return (
    <>
      {attachments[0].el}
      <a href="#" onClick={e => {
        e.preventDefault()
        updateShowMoreModalOpened(true)
      }}>{title}</a>
      <PillModal
        isOpen={showMoreModalOpened}
        onClose={() => {
          updateShowMoreModalOpened(false);
        }}
        title={title}
      >
        <div className='post-attachments-modal-content-wrapper'>
          {attachments.slice(1).map((s, index) => {
            return (
              <div key={index}>
                {s.el}
              </div>
            )
          })}
        </div>
      </PillModal>
    </>
  )
}
