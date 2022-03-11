import React, {useEffect, useState} from 'react'
import {useMediaQuery} from "react-responsive";
import api from "../../api/Api";
import MediaPreview from "../MediaPreview/MediaPreview";
import OwnedMediaModel from "../../models/OwnedMedia"

interface Props {
  onSelectOwnedMedia: (m: OwnedMediaModel) => void
}

export default (props: Props) => {
  const [loading, updateLoading] = useState(true)
  const [mediaList, updateMediaList] = useState<OwnedMediaModel[]>([])
  const [page, updatePage] = useState(1)
  const isTabletOrMobile = useMediaQuery({query: '(max-width: 750px)'})

  useEffect(() => {
    (async () => {
      updateMediaList(await api.getOwnedMedia(page))
      updateLoading(false)
    })()
  }, [])

  if (loading) {
    return null
  }

  return (
    <>
      <MediaPreview
        mediaUrls={mediaList.map(_ => _.mediaUrl)}
        threeRowHeight={isTabletOrMobile ? "30px" : "80px"}
        twoRowHeight={isTabletOrMobile ? "50px" : "100px"}
        oneRowHeight={isTabletOrMobile ? "150px" : "220px"}
        forLinkPreview={false}
        onMediaClick={i => {
          props.onSelectOwnedMedia(mediaList[i])
        }}
      />
      {page > 1 && <div onClick={async () => {
        updateLoading(true)
        updateMediaList(await api.getOwnedMedia(page - 1))
        updateLoading(false)
        updatePage(page - 1)
      }}>Previous</div>}
      {mediaList.length == 9 && <div onClick={async () => {
        updateLoading(true)
        updateMediaList(await api.getOwnedMedia(page + 1))
        updateLoading(false)
        updatePage(page + 1)
      }}>Next</div>}
    </>
  )
}
