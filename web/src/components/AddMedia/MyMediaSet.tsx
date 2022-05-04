import React, {useEffect, useState} from "react";
import MediaSet from "../../models/MediaSet";
import api from "../../api/Api";
import './MyMediaSet.css'
import MediaPane from "../MediaPane/MediaPane";
import MyModal from "../MyModal/MyModal";
import OwnedMedia from "./OwnedMedia";
import MediaNavButtons from "../MediaNavButtons/MediaNavButtons";

export default () => {
  const [loading, updateLoading] = useState(true)
  const [mediaSet, updateMediaSet] = useState<MediaSet | null>(null)
  const [mediaSetListIndex, updateMediaSetListIndex] = useState(0)
  const [addMediaToMediaSetOpened, updateAddMediaToMediaSetOpened] = useState(false)

  useEffect(() => {
    (async () => {
      updateMediaSet(await api.getMyMediaSet())
      updateLoading(false)
    })()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <MediaPane
        mediaUrls={mediaSet !== null ? mediaSet.media_list.slice(mediaSetListIndex * 4, (mediaSetListIndex + 1) * 4).map(m => m.media_url) : []}
        onMediaClick={i => {
          // props.onSelectOwnedMedia(mediaList[i])
        }}
        usePlaceholder={true}
      />
      {mediaSet !== null &&
        <MediaNavButtons
          hasPrevious={mediaSetListIndex !== 0}
          onPrevious={async () => {
            updateMediaSetListIndex(mediaSetListIndex - 1)
          }}
          hasNext={(mediaSetListIndex + 1) * 4 < mediaSet.media_list.length}
          onNext={async () => {
            updateMediaSetListIndex(mediaSetListIndex + 1)
          }}
        />
      }
      <div className='my-media-set-buttons'>
        {mediaSet === null &&
          <div
            className='my-media-set-button my-media-set-button-confirm'
            onClick={async e => {
              e.preventDefault()
              updateLoading(true)
              await api.createMyMediaSet()
              updateMediaSet(await api.getMyMediaSet())
              updateLoading(false)
            }}
          >Create sticker pack</div>
        }
        {mediaSet !== null &&
          <div
            className='my-media-set-button my-media-set-button-confirm'
            onClick={async e => {
              e.preventDefault()
              updateAddMediaToMediaSetOpened(true)
            }}
          >Add media to pack</div>
        }
        {mediaSet !== null && !mediaSet.is_public &&
          <div
            className='my-media-set-button my-media-set-button-danger'
            onClick={async e => {
              e.preventDefault()
              if (!confirm("Are you sure you want to make your sticker pack public? This operation cannot be reverted.")) {
                return
              }
              updateLoading(true)
              await api.makeMyMediaSetPublic()
              updateMediaSet(await api.getMyMediaSet())
              updateLoading(false)
            }}
          >Make pack public</div>
        }
        {mediaSet !== null &&
          <div
            className='my-media-set-button my-media-set-button-danger'
            onClick={async e => {
              e.preventDefault()
              if (!confirm("Are you sure you want to delete your sticker pack? Media contained in the pack won't be deleted.")) {
                return
              }
              updateLoading(true)
              await api.deleteMyMediaSet()
              updateMediaSet(await api.getMyMediaSet())
              updateLoading(false)
            }}
          >Delete pack</div>
        }
      </div>
      <MyModal
        isOpen={addMediaToMediaSetOpened}
        onClose={() => {updateAddMediaToMediaSetOpened(false)}}
      >
        <OwnedMedia
          onSelectOwnedMedia={async m => {
            updateAddMediaToMediaSetOpened(false)
            updateLoading(true)
            await api.addMediaToMyMediaSet(m.object_name)
            updateMediaSet(await api.getMyMediaSet())
            updateLoading(false)
          }}
        />
      </MyModal>
    </div>
  )
}
