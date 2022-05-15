type LinkPreviewState = 'fetching' | 'fetched' | 'errored'

export default interface LinkPreview {
  url: string
  title: string
  subtitle: string
  image_urls: string[]
  state: LinkPreviewState,
  retry_in_seconds: number
}
