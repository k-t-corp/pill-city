import React, {useEffect, useState} from "react";
import MediaSet from "../../models/MediaSet";
import api from "../../api/Api";
import './MyMediaSet.css'
import MediaPane from "../MediaPane/MediaPane";
import MyModal from "../MyModal/MyModal";
import OwnedMedia from "./OwnedMedia";
import MediaNavButtons from "../MediaNavButtons/MediaNavButtons";
import Media from "../../models/Media";

interface Props {
  onSelectMedia: (m: Media) => void
}

export default (props: Props) => {
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

  if (mediaSet === null) {
    return (
      <div>
        <MediaPane
          mediaUrls={[]}
          usePlaceholder={true}
        />
        <div className='my-media-set-buttons'>
          <div
            className='my-media-set-button my-media-set-button-confirm'
            onClick={async e => {
              e.preventDefault()
              updateLoading(true)
              await api.createMyMediaSet()
              updateMediaSet(await api.getMyMediaSet())
              updateLoading(false)
            }}
          >Create sticker pack
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <MediaPane
        mediaUrls={mediaSet.media_list.slice(mediaSetListIndex * 4, (mediaSetListIndex + 1) * 4).map(m => m.media_url)}
        mediaOperations={[
          {
            op: 'Use',
            action: (i) => {
              props.onSelectMedia(mediaSet.media_list[mediaSetListIndex * 4 + i])
            }
          },
          {
            op: 'Remove',
            action: (async (i) => {
              const removedMedia = mediaSet.media_list[mediaSetListIndex * 4 + i]
              updateLoading(true)
              await api.removeMediaFromMyMediaSet(removedMedia.object_name)
              updateMediaSet(await api.getMyMediaSet())
              updateLoading(false)
            })
          }
        ]}
        usePlaceholder={true}
      />
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
      <div className='my-media-set-buttons'>
        <div
          className='my-media-set-button my-media-set-button-confirm'
          onClick={async e => {
            e.preventDefault()
            updateAddMediaToMediaSetOpened(true)
          }}
        >Add media to pack
        </div>
        {!mediaSet.is_public &&
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
        >Delete pack
        </div>
      </div>
      <MyModal
        isOpen={addMediaToMediaSetOpened}
        onClose={() => {
          updateAddMediaToMediaSetOpened(false)
        }}
      >
        <OwnedMedia
          selectMediaOp={'Add'}
          onSelectOwnedMedia={async m => {
            updateAddMediaToMediaSetOpened(false)
            updateLoading(true)
            try {
              await api.addMediaToMyMediaSet(m.object_name)
            } catch (e: any) {
              if (e.message) {
                alert(e.message)
              } else {
                alert("Unknown error")
              }
            } finally {
              updateMediaSet(await api.getMyMediaSet())
              updateLoading(false)
            }
          }}
        />
      </MyModal>
    </div>
  )
}
