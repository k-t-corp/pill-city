import os
import urllib.parse
import mongoengine
import linkpreview
from pymongo.uri_parser import parse_uri
from celery import Celery
from celery.utils.log import get_task_logger
from mini_gplus.models import LinkPreview, LinkPreviewState

twitter_domains = [
    "twitter.com",
    "www.twitter.com",
    "mobile.twitter.com"
]


def _is_twitter(url: str) -> bool:
    parsed_url = urllib.parse.urlparse(url)
    if parsed_url.netloc in twitter_domains:
        return True
    return False


def _get_nitter_url(url: str) -> str:
    parsed_url = urllib.parse.urlparse(url)
    parsed_url = parsed_url._replace(netloc=os.environ['NITTER_HOST'])
    return parsed_url.geturl()


celery = Celery('tasks', broker=os.environ['REDIS_URL'])
logger = get_task_logger(__name__)

# todo: pretty hacky but hey
inited_mongo = [False]


def init_mongo():
    if not inited_mongo[0]:
        mongodb_uri = os.environ['MONGODB_URI']
        mongodb_db = parse_uri(mongodb_uri)['database']
        mongoengine.connect(mongodb_db, host=mongodb_uri)
        inited_mongo[0] = True


@celery.task(rate_limit='8/m')
def generate_link_preview(url: str):
    init_mongo()
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
