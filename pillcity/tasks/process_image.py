import os
from mongoengine import connect, disconnect
from pillcity.models import Media
from .celery import app, logger


@app.task()
def process_image(_id: str):
    connect(host=os.environ['MONGODB_URI'])
    logger.info(f"Processing image {_id}")
    media = Media.objects.get(id=_id)  # type: Media
    try:
        pass
    except Exception as e:
        logger.warn(str(e))
    disconnect()
