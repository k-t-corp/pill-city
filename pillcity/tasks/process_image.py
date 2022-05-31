import os
import uuid
import tempfile
from mongoengine import connect, disconnect
from pillcity.models import Media
from pillcity.utils.s3 import get_s3_client
from .celery import app, logger


@app.task()
def process_image(_id: str):
    connect(host=os.environ['MONGODB_URI'])
    logger.info(f"Processing image {_id}")
    media = Media.objects.get(id=_id)  # type: Media
    try:
        # download the image from s3
        temp_fp = os.path.join(tempfile.gettempdir(), str(uuid.uuid4()))
        s3_client, s3_bucket_name = get_s3_client()
        with open(temp_fp, 'wb') as f:
            s3_client.download_fileobj(s3_bucket_name, media.id, f)

        # compute metadata
        # convert to resized webp
        # upload resized webp to s3
        # set media as processed
        pass
    except Exception as e:
        logger.warn(str(e))
    disconnect()
