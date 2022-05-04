import React, {useEffect, useState} from 'react'
import api from "../../api/Api";
import MediaPane from "../MediaPane/MediaPane";
import Media from "../../models/Media"
import MediaNavButtons from "../MediaNavButtons/MediaNavButtons";
import './OwnedMedia.css'

interface Props {
  onSelectOwnedMedia: (m: Media) => void
}

export default (props: Props) => {
  const [loading, updateLoading] = useState(true)
  const [mediaList, updateMediaList] = useState<Media[]>([])
  const [page, updatePage] = useState(1)

  useEffect(() => {
    (async () => {
      updateMediaList(await api.getOwnedMedia(page))
      updateLoading(false)
    })()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <MediaPane
        mediaUrls={mediaList.map(_ => _.media_url)}
        onMediaClick={i => {
          props.onSelectOwnedMedia(mediaList[i])
        }}
        usePlaceholder={true}
      />
      <MediaNavButtons
        hasPrevious={page !== 1}
        onPrevious={async () => {
          updateLoading(true)
          updateMediaList(await api.getOwnedMedia(page - 1))
          updateLoading(false)
          updatePage(page - 1)
        }}
        hasNext={mediaList.length === 4}
        onNext={async () => {
          updateLoading(true)
          updateMediaList(await api.getOwnedMedia(page + 1))
          updateLoading(false)
          updatePage(page + 1)
        }}
      />
    </div>
  )
}
