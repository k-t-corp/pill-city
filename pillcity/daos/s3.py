import os
import boto3
import tempfile
import uuid
from typing import Optional
from PIL import Image, UnidentifiedImageError
from .cache import r, RMediaUrl

AllowedImageTypes = ['gif', 'jpeg', 'bmp', 'png']


def upload_to_s3(file, object_name_stem: str) -> Optional[str]:
    s3_client = boto3.client(
        's3',
        endpoint_url=os.environ['S3_ENDPOINT_URL'],
        region_name=os.environ.get('AWS_REGION', ''),
        aws_access_key_id=os.environ['AWS_ACCESS_KEY'],
        aws_secret_access_key=os.environ['AWS_SECRET_KEY']
    )
    s3_bucket_name = os.environ['S3_BUCKET_NAME']

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
    s3_client = boto3.client(
        's3',
        endpoint_url=os.environ['S3_ENDPOINT_URL'],
        region_name=os.environ.get('AWS_REGION', ''),
        aws_access_key_id=os.environ['AWS_ACCESS_KEY'],
        aws_secret_access_key=os.environ['AWS_SECRET_KEY']
    )
    s3_bucket_name = os.environ['S3_BUCKET_NAME']

    s3_client.delete_object(Bucket=s3_bucket_name, Key=object_name)
    r.hdel(RMediaUrl, object_name)
