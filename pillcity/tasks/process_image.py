import os
import uuid
import tempfile
from typing import Tuple
from mongoengine import connect, disconnect
from PIL import Image
from colorthief import ColorThief
from pillcity.models import Media
from pillcity.utils.s3 import get_s3_client
from .celery import app, logger


IMAGE_RESIZE_SIZE = (1920, 1080)


def rgb_tuple_to_hex_str(rgb_tuple: Tuple[int, int, int]) -> str:
    r, g, b = rgb_tuple
    return hex(r).replace("0x", "") + hex(g).replace("0x", "") + hex(b).replace("0x", "")


@app.task()
def process_image(_id: str):
    connect(host=os.environ['MONGODB_URI'])
    logger.info(f"Processing image {_id}")
    media = Media.objects.get(id=_id)  # type: Media
    try:
        logger.info(f"Processing media {media.id}")
        s3_client, s3_bucket_name = get_s3_client()

        logger.info(f"Downloading media {media.id} from s3")
        original_fp = os.path.join(tempfile.gettempdir(), str(uuid.uuid4()))
        with open(original_fp, 'wb') as f:
            s3_client.download_fileobj(s3_bucket_name, media.id, f)

        logger.info(f"Extracting metadata from media {media.id}")
        im = Image.open(original_fp)
        width, height = im.size
        dominant_color_hex = rgb_tuple_to_hex_str(ColorThief(original_fp).get_color(quality=1))

        logger.info(f"Converting media {media.id} to resized webp")
        resized_fp = os.path.join(tempfile.gettempdir(), str(uuid.uuid4()))
        im.thumbnail(IMAGE_RESIZE_SIZE)
        im = im.convert('RGB')
        im.save(resized_fp, 'webp')

        logger.info(f"Uploading resized webp for media {media.id}")
        s3_client.upload_file(
            Filename=resized_fp,
            Bucket=s3_bucket_name,
            Key=media.get_processed_object_name(),
            ExtraArgs={
                'ContentType': "image/webp}",
            }
        )

        logger.info(f"Saving processed metadata for media {media.id}")
        media.processed = True
        media.width = width
        media.height = height
        media.dominant_color_hex = dominant_color_hex
        media.save()

        os.remove(original_fp)
        os.remove(resized_fp)
    except Exception as e:
        logger.warn(str(e))
    disconnect()
