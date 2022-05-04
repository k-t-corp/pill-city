import React, {useEffect, useState} from "react";
import MediaSet from "../../models/MediaSet";
import api from "../../api/Api";
import ClickableId from "../ClickableId/ClickableId";
import MediaPane from "../MediaPane/MediaPane";
import MediaNavButtons from "../MediaNavButtons/MediaNavButtons";
import Media from "../../models/Media";

interface Props {
  onSelectMedia: (m: Media) => void
}

export default (props: Props) => {
  const [loading, updateLoading] = useState(true)
  const [mediaSets, updateMediaSets] = useState<MediaSet[]>([])
  const [mediaSetListIndices, updateMediaSetListIndices] = useState<number[]>([])


  useEffect(() => {
    (async () => {
      const mediaSets = await api.getPublicMediaSets() as MediaSet[]
      updateMediaSets(mediaSets)
      updateMediaSetListIndices(mediaSets.map(_ => 0))
      updateLoading(false)
    })()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (mediaSets.length === 0) {
    return <div>No public sticker packs</div>
  }

  return (
    <div>
      {mediaSets.map((ms, i) => {
        const mediaSetListIndex = mediaSetListIndices[i]
        const mediaSet = mediaSets[i]
        return (
          <div key={ms.id}>
            <ClickableId user={ms.owner}/>
            <MediaPane
              mediaUrls={ms.media_list.slice(mediaSetListIndex * 4, (mediaSetListIndex + 1) * 4).map(m => m.media_url)}
              mediaOperations={[
                {
                  op: 'Use',
                  action: i => {
                    props.onSelectMedia(mediaSet.media_list[mediaSetListIndex * 4 + i])
                  }
                }
              ]}
              usePlaceholder={true}
            />
            <MediaNavButtons
              hasPrevious={mediaSetListIndex !== 0}
              onPrevious={async () => {
                updateMediaSetListIndices(mediaSetListIndices.map((v, ii) => i === ii ? v - 1 : v))
              }}
              hasNext={(mediaSetListIndex + 1) * 4 < mediaSet.media_list.length}
              onNext={async () => {
                updateMediaSetListIndices(mediaSetListIndices.map((v, ii) => i === ii ? v + 1 : v))
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
