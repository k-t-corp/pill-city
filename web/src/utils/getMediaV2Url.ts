import MediaUrlV2 from "../models/MediaUrlV2";

const getMediaV2Url = (mediaUrlV2: MediaUrlV2): string => {
  if (!mediaUrlV2.processed) {
    return mediaUrlV2.original_url
  }
  return mediaUrlV2.processed_url
}

export default getMediaV2Url
