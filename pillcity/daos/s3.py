import os
import tempfile
import uuid
from typing import Optional
from PIL import Image, UnidentifiedImageError
from pillcity.utils.s3 import get_s3_client
from .cache import r, RMediaUrl

AllowedImageTypes = ['gif', 'jpeg', 'bmp', 'png', 'webp']


def upload_to_s3(file, object_name_stem: str) -> Optional[str]:
    s3_client, s3_bucket_name = get_s3_client()

    # check file size
    # flask will limit upload size for us :)
    # would return 413 if file is too large

    # save the file
    temp_fp = os.path.join(tempfile.gettempdir(), str(uuid.uuid4()))
    file.save(temp_fp)

    # check upload format
    try:
        img_type = Image.open(temp_fp).format.lower()
    except UnidentifiedImageError:
        return None
    if img_type not in AllowedImageTypes:
        return None

    # upload the file
    object_name = f"{object_name_stem}.{img_type}"
    s3_client.upload_file(
        Filename=temp_fp,
        Bucket=s3_bucket_name,
        Key=object_name,
        ExtraArgs={
            'ContentType': f"image/{img_type}",
        }
    )

    # update user model
    os.remove(temp_fp)

    return object_name


def delete_from_s3(object_name: str):
    s3_client, s3_bucket_name = get_s3_client()

    s3_client.delete_object(Bucket=s3_bucket_name, Key=object_name)
    r.hdel(RMediaUrl, object_name)
