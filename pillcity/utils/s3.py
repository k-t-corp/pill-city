import os
import boto3
from typing import Tuple


def get_s3_client() -> Tuple[any, str]:
    s3_client = boto3.client(
        's3',
        endpoint_url=os.environ['S3_ENDPOINT_URL'],
        region_name=os.environ.get('AWS_REGION', ''),
        aws_access_key_id=os.environ['AWS_ACCESS_KEY'],
        aws_secret_access_key=os.environ['AWS_SECRET_KEY']
    )
    s3_bucket_name = os.environ['S3_BUCKET_NAME']
    return s3_client, s3_bucket_name
