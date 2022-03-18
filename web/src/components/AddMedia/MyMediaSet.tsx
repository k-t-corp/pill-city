import React, {useEffect, useState} from "react";
import MediaSet from "../../models/MediaSet";
import api from "../../api/Api";
import './MyMediaSet.css'

interface Props {
  onEmptyAddNewMedia: () => void
}

export default (props: Props) => {
  const [loading, updateLoading] = useState(true)
  const [mediaSet, updateMediaSet] = useState<MediaSet | null>(null)

  useEffect(() => {
    (async () => {
      updateMediaSet(await api.getMyMediaSet())
      updateLoading(false)
    })()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (mediaSet === null) {
    return (
      <div
        className='my-media-set-empty'
        onClick={async () => {
          updateLoading(true)
          await api.createMyMediaSet()
          updateMediaSet(await api.getMyMediaSet())
          updateLoading(false)
        }}
      >Create my sticker pack</div>
    )
  }

  return (
    <div>
      {
        mediaSet.media_list.length === 0 &&
          <div
            className='my-media-set-empty'
            onClick={props.onEmptyAddNewMedia}
          >Add media</div>
      }
      <div className='my-media-set-controls'>
        {!mediaSet.is_public &&
          <div
            className='my-media-set-button my-media-set-button-danger'
            onClick={async () => {
              if (!confirm("Are you sure you want to make your sticker pack public? This operation cannot be reverted.")) {
                return
              }
              updateLoading(true)
              await api.makeMyMediaSetPublic()
              updateMediaSet(await api.getMyMediaSet())
              updateLoading(false)
            }}
          >Make it public</div>
        }
        <div
          className='my-media-set-button my-media-set-button-danger'
          onClick={async () => {
            if (!confirm("Are you sure you want to delete your sticker pack? Media contained in the pack won't be deleted.")) {
              return
            }
            updateLoading(true)
            await api.deleteMyMediaSet()
            updateMediaSet(await api.getMyMediaSet())
            updateLoading(false)
          }}
        >Delete</div>
      </div>
    </div>
  )
}
