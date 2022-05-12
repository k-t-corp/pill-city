import os
import urllib.parse
import linkpreview
from mongoengine import connect
from celery import Celery
from celery.utils.log import get_task_logger
from pillcity.models import LinkPreview, LinkPreviewState

twitter_domains = [
    "twitter.com",
    "www.twitter.com",
    "mobile.twitter.com"
]

connect(host=os.environ['MONGODB_URI'])
celery = Celery('tasks', broker=os.environ['REDIS_URL'])
logger = get_task_logger(__name__)


def _is_twitter(url: str) -> bool:
    parsed_url = urllib.parse.urlparse(url)
    if parsed_url.netloc in twitter_domains:
        return True
    return False


def _get_nitter_url(url: str) -> str:
    parsed_url = urllib.parse.urlparse(url)
    parsed_url = parsed_url._replace(netloc=os.environ['NITTER_HOST'])
    return parsed_url.geturl()


@celery.task()
def generate_link_preview(url: str):
    logger.info(f'Generating link preview for url {url}')
    link_preview = LinkPreview.objects.get(url=url)
    try:
        if _is_twitter(url):
            preview = linkpreview.link_preview(_get_nitter_url(url))
        else:
            preview = linkpreview.link_preview(url)
        link_preview.title = preview.title
        link_preview.subtitle = preview.description
        if preview.absolute_image:
            link_preview.image_urls = [preview.absolute_image]
        link_preview.state = LinkPreviewState.Fetched
    except:
        link_preview.state = LinkPreviewState.Errored
    link_preview.save()
