import os
import boto3
import json
import werkzeug
import uuid
from typing import List
from flask_restful import reqparse, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from pillcity.daos.media import get_media
from pillcity.daos.user import find_user
from pillcity.utils.now_ms import now_ms
from pillcity.utils.profiling import timer
from .cache import r, RMediaUrl
from .s3 import upload_to_s3


MaxMediaCount = 4
PostMediaUrlExpireSeconds = 3600 * 12  # 12 hours


# Cache structure within Redis
# "mediaUrl" -> object_name -> "media url"(space)"media url generated time in ms"


class MediaUrls(fields.Raw):
    def format(self, media_list):
        if not media_list:
            return []

        @timer
        def get_media_url(media):
            object_name = media.id
            # subtract expiry by 10 seconds for some network overhead
            r_media_url = r.hget(RMediaUrl, object_name)
            if r_media_url:
                r_media_url = r_media_url.decode('utf-8')
                if now_ms() < int(r_media_url.split(" ")[1]) + (PostMediaUrlExpireSeconds - 10) * 1000:
                    return r_media_url.split(" ")[0]

            sts_client = boto3.client(
                'sts',
                endpoint_url=os.environ['STS_ENDPOINT_URL'],
                region_name=os.environ.get('AWS_REGION', ''),
                aws_access_key_id=os.environ['AWS_ACCESS_KEY'],
                aws_secret_access_key=os.environ['AWS_SECRET_KEY']
            )
            s3_bucket_name = os.environ['S3_BUCKET_NAME']

            # obtain temp token
            read_media_policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Action": "s3:GetObject",
                        "Resource": [f"arn:aws:s3:::{s3_bucket_name}/{object_name}"],
                    },
                ],
            }
            assume_role_response = sts_client.assume_role(
                # for minio this is moot
                # for s3 this role allows all media read, but intersects with the inline policy, the temp role
                #    would still be minimal privilege
                RoleArn=os.environ['MEDIA_READER_ROLE_ARN'],
                # media-reader is the only principal who can assume the role so this can be fixed
                RoleSessionName='media-reader',
                Policy=json.dumps(read_media_policy),
                DurationSeconds=PostMediaUrlExpireSeconds,
            )
            temp_s3_client = boto3.client(
                's3',
                endpoint_url=os.environ['S3_ENDPOINT_URL'],
                region_name=os.environ.get('AWS_REGION', ''),
                aws_access_key_id=assume_role_response['Credentials']['AccessKeyId'],
                aws_secret_access_key=assume_role_response['Credentials']['SecretAccessKey'],
                aws_session_token=assume_role_response['Credentials']['SessionToken'],
            )

            # get pre-signed url
            media_url = temp_s3_client.generate_presigned_url(
                ClientMethod='get_object',
                Params={'Bucket': s3_bucket_name, 'Key': media.id},
                ExpiresIn=PostMediaUrlExpireSeconds
            )

            r.hset(RMediaUrl, object_name, f"{media_url} {now_ms()}")
            return media_url

        return list(map(get_media_url, media_list))


media_parser = reqparse.RequestParser()
for i in range(MaxMediaCount):
    media_parser.add_argument('media' + str(i), type=werkzeug.datastructures.FileStorage, location='files',
                              required=False, default=None)


class Media(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        user = find_user(user_id)
        if not user:
            return {'msg': f'User {user_id} is not found'}, 404

        args = media_parser.parse_args()
        media_files = []
        for i in range(MaxMediaCount):
            media_file = args['media' + str(i)]
            if media_file:
                media_files.append(media_file)
        media_object_names = []
        for media_file in media_files:
            object_name_stem = f"media/{uuid.uuid4()}"
            media_object = upload_to_s3(media_file, object_name_stem, user)
            if not media_object:
                return {'msg': f"Disallowed image type"}, 400
            media_object_names.append(media_object.id)

        return media_object_names, 201


def check_media_object_names(media_object_names: List[str], limit: int) -> List[Media]:
    media_objects = []
    for media_object_name in media_object_names[: limit]:
        media_object = get_media(media_object_name)
        if media_object:
            media_objects.append(media_object)
    return media_objects
