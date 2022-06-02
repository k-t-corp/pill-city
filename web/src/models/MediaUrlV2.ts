type MediaUrlV2 = UnprocessedMedia | ProcessedMedia

interface UnprocessedMedia {
  original_url: string
  processed: false
}

interface ProcessedMedia {
  original_url: string
  processed: true
  processed_url: string
  width: number
  height: number
  dominant_color_hex: string
}

export default MediaUrlV2
