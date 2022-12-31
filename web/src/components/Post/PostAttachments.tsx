import React, {useState} from "react"
import './PostAttachments.css'
import PillModal from "../PillModal/PillModal";
import PillTabs from "../PillTabs/PillTabs";

export interface PostAttachment {
  title: string,
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

  return (
    <>
      {attachments[0].el}
      <a href="#" onClick={e => {
        e.preventDefault()
        updateShowMoreModalOpened(true)
      }}>More post attachments</a>
      <PillModal
        isOpen={showMoreModalOpened}
        onClose={() => {
          updateShowMoreModalOpened(false);
        }}
        title='More post attachments'
      >
        <div className='post-attachments-modal-content-wrapper'>
          <PillTabs
            tabs={attachments.slice(1).map(attachment => {
              return {
                title: attachment.title,
                el: attachment.el
              }
            })}
          />
        </div>
      </PillModal>
    </>
  )
}
