import os
import linkpreview
from mongoengine import connect, disconnect
from pillcity.models import LinkPreview, LinkPreviewState
from .celery import app, logger


@app.task()
def generate_link_preview(url: str):
    connect(host=os.environ['MONGODB_URI'])
    logger.info(f'Generating link preview for url {url}')
    link_preview = LinkPreview.objects.get(url=url)  # type: LinkPreview
    try:
        proxies = {}
        if link_preview.errored_retries > 0 and 'LINK_PREVIEW_RETRY_PROXIES' in os.environ:
            proxies = {"http": os.environ['LINK_PREVIEW_RETRY_PROXIES'], "https": os.environ['LINK_PREVIEW_RETRY_PROXIES']}
        preview = linkpreview.link_preview(url, proxies=proxies)

        link_preview.title = preview.title
        link_preview.subtitle = preview.description
        if preview.absolute_image:
            link_preview.image_urls = [preview.absolute_image]
        link_preview.state = LinkPreviewState.Fetched
    except Exception as e:
        logger.warn(str(e))
        link_preview.state = LinkPreviewState.Errored
    link_preview.save()
    disconnect()
