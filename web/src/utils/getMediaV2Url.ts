import MediaUrlV2 from "../models/MediaUrlV2";

export default (mediaUrlV2: MediaUrlV2): string => {
  if (!mediaUrlV2.processed) {
    return mediaUrlV2.original_url
  }
  return mediaUrlV2.processed_url
}
