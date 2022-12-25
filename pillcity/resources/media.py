import os
import werkzeug
import uuid
import base64
import datetime
from typing import List
from urllib.parse import urlparse, parse_qs
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from botocore.signers import CloudFrontSigner
from flask_restful import reqparse, Resource, fields, marshal_with
from flask_jwt_extended import jwt_required, get_jwt_identity
from pillcity.models.media import Media
from pillcity.daos.media import get_media, create_media, get_media_page
from pillcity.daos.user import find_user
from pillcity.utils.now import now_seconds
from pillcity.utils.profiling import timer
from .cache import r, RMediaUrl


MaxMediaCount = 4
GetMediaPageCount = 4


def rsa_signer(message):
    private_key = serialization.load_pem_private_key(
        base64.b64decode(os.environ["CF_SIGNER_PRIVATE_KEY_ENCODED"]),
        password=None,
        backend=default_backend()
    )
    return private_key.sign(message, padding.PKCS1v15(), hashes.SHA1())


# Cache structure within Redis
# "mediaUrl" -> object_name -> "media url"(space)"media url expire time in seconds"

@timer
def get_media_url(object_name: str) -> str:
    """
    Get the publicly accessible URL to a media
    """
    r_media_url = r.hget(RMediaUrl, object_name)
    if r_media_url:
        r_media_url = r_media_url.decode('utf-8')
        media_url, expire_seconds_str = r_media_url.split(' ')
        # subtract expiry by 10 seconds for some network overhead
        if now_seconds() < int(expire_seconds_str) - 10:
            return media_url

    key_id = os.environ["CF_SIGNER_KEY_ID"]
    url = f'https://{os.environ["CF_DISTRIBUTION_DOMAIN_NAME"]}/{object_name}'

    # TODO: for some reason the returned actual_expire_seconds does not respect try_expire_date
    try_expire_date = datetime.datetime.now() + datetime.timedelta(hours=12)

    cloudfront_signer = CloudFrontSigner(key_id, rsa_signer)
    media_url = cloudfront_signer.generate_presigned_url(url, date_less_than=try_expire_date)
    actual_expire_seconds = parse_qs(urlparse(media_url).query)['Expires'][0]

    r.hset(RMediaUrl, object_name, f"{media_url} {actual_expire_seconds}")
    return media_url


def get_media_url_v2(object_name: str) -> dict:
    """
    Get a dict representing a media that could have been processed (or not)
    """
    media = get_media(object_name)
    if not media.processed:
        return {
            "original_url": get_media_url(media.id),
            "processed": False
        }
    return {
        "original_url": get_media_url(media.id),
        "processed": True,
        "processed_url": get_media_url(media.get_processed_object_name()),
        "width": media.width,
        "height": media.height,
        "dominant_color_hex": media.dominant_color_hex
    }


class MediaUrlV2(fields.Raw):
    def format(self, object_name: str):
        return get_media_url_v2(object_name)


class MediaUrlsV2(fields.Raw):
    def format(self, media_list: List[Media]):
        if not media_list:
            return []
        return list(map(lambda m: get_media_url_v2(m.id), media_list))


media_fields = {
    "object_name": fields.String(attribute='id'),
    "media_url_v2": MediaUrlV2(attribute='id')
}


post_media_parser = reqparse.RequestParser()
for i in range(MaxMediaCount):
    post_media_parser.add_argument('media' + str(i), type=werkzeug.datastructures.FileStorage, location='files',
                                   required=False, default=None)


get_media_parser = reqparse.RequestParser()
get_media_parser.add_argument('page', type=int, required=True, location='args')


class Media(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        user = find_user(user_id)
        if not user:
            return {'msg': f'User {user_id} is not found'}, 404

        args = post_media_parser.parse_args()
        media_files = []
        for i in range(MaxMediaCount):
            media_file = args['media' + str(i)]
            if media_file:
                media_files.append(media_file)
        media_object_names = []
        for media_file in media_files:
            object_name_stem = f"media/{uuid.uuid4()}"
            media_object = create_media(media_file, object_name_stem, user)
            if not media_object:
                return {'msg': f"Disallowed image type"}, 400
            media_object_names.append(media_object.id)

        return media_object_names, 201

    @jwt_required()
    @marshal_with(media_fields)
    def get(self):
        user_id = get_jwt_identity()
        user = find_user(user_id)
        if not user:
            return {'msg': f'User {user_id} is not found'}, 404

        args = get_media_parser.parse_args()
        page_number = args['page']
        if page_number < 1:
            return {'msg': f'Invalid page number'}, 400

        return get_media_page(user, page_number - 1, GetMediaPageCount), 200


def check_media_object_names(media_object_names: List[str], limit: int) -> List[Media]:
    media_objects = []
    for media_object_name in media_object_names[: limit]:
        media_object = get_media(media_object_name)
        if media_object:
            media_objects.append(media_object)
    return media_objects
