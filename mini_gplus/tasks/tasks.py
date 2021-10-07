import os
import mongoengine
import linkpreview
from pymongo.uri_parser import parse_uri
from celery import Celery
from celery.utils.log import get_task_logger
from mini_gplus.models import LinkPreview, LinkPreviewState

celery = Celery('tasks', broker=os.environ['REDIS_URL'])
logger = get_task_logger(__name__)


@celery.task
def generate_link_preview(url: str):
    # todo: pretty hacky but hey
    mongodb_uri = os.environ['MONGODB_URI']
    mongodb_db = parse_uri(mongodb_uri)['database']
    mongoengine.connect(mongodb_db, host=mongodb_uri)

    logger.info(f'Generating link preview for url {url}')
    link_preview = LinkPreview.objects.get(url=url)
    try:
        preview = linkpreview.link_preview(url)
        link_preview.title = preview.title
        link_preview.subtitle = preview.description
        if preview.absolute_image:
            link_preview.image_urls = [preview.absolute_image]
        link_preview.state = LinkPreviewState.Fetched
    except:
        link_preview.state = LinkPreviewState.Errored
    link_preview.save()
