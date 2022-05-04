import React, {useEffect, useState} from 'react'
import api from "../../api/Api";
import MediaPane from "../MediaPane/MediaPane";
import Media from "../../models/Media"
import {ChevronDoubleLeftIcon} from "@heroicons/react/solid";
import {ChevronDoubleRightIcon} from "@heroicons/react/solid";
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
      <div className='owned-media-nav-buttons'>
        <div
          className='owned-media-nav-button'
          style={{visibility: page === 1 ? 'hidden' : 'visible'}}
          onClick={async e => {
            e.preventDefault()
            if (page === 1) {
              return
            }
            updateLoading(true)
            updateMediaList(await api.getOwnedMedia(page - 1))
            updateLoading(false)
            updatePage(page - 1)
          }}
        >
          <ChevronDoubleLeftIcon className='owned-media-nav-icon'/>
        </div>
        <div
          className='owned-media-nav-button'
          style={{visibility: mediaList.length !== 4 ? 'hidden' : 'visible'}}
          onClick={async e => {
            e.preventDefault()
            if (mediaList.length !== 4) {
              return
            }
            updateLoading(true)
            updateMediaList(await api.getOwnedMedia(page + 1))
            updateLoading(false)
            updatePage(page + 1)
          }}
        >
          <ChevronDoubleRightIcon className='owned-media-nav-icon'/>
        </div>
      </div>
    </div>
  )
}
