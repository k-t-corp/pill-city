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

const PostAttachments = (props: Props) => {
  const {attachments} = props
  const [showMoreModalOpened, updateShowMoreModalOpened] = useState(false)

  if (attachments.length === 0) {
    return null
  }

  if (attachments.length === 1) {
    return attachments[0].el
  }

  return (
    <>
      {attachments[0].el}
      <button type='button' className='link-button' onClick={e => {
        e.preventDefault()
        updateShowMoreModalOpened(true)
      }}>More post attachments</button>
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

export default PostAttachments
