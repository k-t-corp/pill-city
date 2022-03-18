import React, {useEffect, useState} from "react";
import MediaSet from "../../models/MediaSet";
import api from "../../api/Api";

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
      <>
        <p>No media set</p>
        <a href="#" onClick={async () => {
          updateLoading(true)
          await api.createMyMediaSet()
          updateMediaSet(await api.getMyMediaSet())
          updateLoading(false)
        }}>Create one</a>
      </>
    )
  }

  return (
    <div>
      {
        mediaSet.media_list.length === 0 &&
        <>
          <p>No media in my media set</p>
          <a href="#" onClick={props.onEmptyAddNewMedia}>Pick some from uploaded media</a>
        </>
      }
      <p></p>
      <p>{mediaSet.is_public ? '(Public)' : "(Private)"}</p>
      {!mediaSet.is_public &&
        <p>
          <a href="#" onClick={async () => {
            if (!confirm("Are you sure you want to make your media set public? This operation cannot be reverted.")) {
              return
            }
            updateLoading(true)
            await api.makeMyMediaSetPublic()
            updateMediaSet(await api.getMyMediaSet())
            updateLoading(false)
          }}>Make my media set public</a>
        </p>
      }
      <p>
        <a href="#" onClick={async () => {
          if (!confirm("Are you sure you want to delete your media set? Media contained in the media set won't be deleted.")) {
            return
          }
          updateLoading(true)
          await api.deleteMyMediaSet()
          updateMediaSet(await api.getMyMediaSet())
          updateLoading(false)
        }}>Delete my media set</a>
      </p>
    </div>
  )
}
