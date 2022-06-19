type LinkPreviewState = 'fetching' | 'fetched' | 'errored'

export default interface LinkPreview {
  url: string
  title: string
  subtitle: string
  image_urls: string[]
  state: LinkPreviewState
  errored_next_refetch_seconds: number,
  index_start: number
  index_end: number
}
