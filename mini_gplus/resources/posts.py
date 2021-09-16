import os
import boto3
import werkzeug
import uuid
import json
import redis
from flask_restful import reqparse, Resource, fields, marshal_with
from flask_jwt_extended import jwt_required, get_jwt_identity
from mini_gplus.daos.user import find_user
from mini_gplus.daos.circle import find_circle
from mini_gplus.daos.post import get_post, create_post, sees_post, retrieves_posts_on_home, retrieves_posts_on_profile
from mini_gplus.daos.media import get_media
from mini_gplus.utils.now_ms import now_ms
from mini_gplus.utils.profiling import timer
from .me import user_fields
from .upload_to_s3 import upload_to_s3
from .pagination import pagination_parser
from .mention import check_mentioned_user_ids

MaxPostMediaCount = 4
PostMediaUrlExpireSeconds = 3600 * 12  # 12 hours

r = redis.Redis.from_url(os.environ['REDIS_URL'])
RMediaUrl = "mediaUrl"

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


post_fields = {
    'id': fields.String(attribute='eid'),
    'created_at_seconds': fields.Integer(attribute='created_at'),
    'author': fields.Nested(user_fields),
    'content': fields.String,
    'is_public': fields.Boolean,
    'reshareable': fields.Boolean,
    'reshared_from': fields.Nested({
        # this is a trimmed down version of post_fields
        'id': fields.String(attribute='eid'),
        'created_at_seconds': fields.Integer(attribute='created_at'),
        'author': fields.Nested(user_fields),
        'content': fields.String,
        'media_urls': MediaUrls(attribute='media_list'),
    }, allow_null=True),
    'media_urls': MediaUrls(attribute='media_list'),
    'reactions': fields.List(fields.Nested({
        'id': fields.String(attribute='eid'),
        'emoji': fields.String,
        'author': fields.Nested(user_fields),
    }), attribute='reactions2'),
    'comments': fields.List(fields.Nested({
        'id': fields.String(attribute='eid'),
        'created_at_seconds': fields.Integer(attribute='created_at'),
        'author': fields.Nested(user_fields),
        'content': fields.String,
        # we only assume two-levels of nesting for comments, so no need to recursively define comments fields
        'comments': fields.List(fields.Nested({
            'id': fields.String(attribute='eid'),
            'created_at_seconds': fields.Integer(attribute='created_at'),
            'author': fields.Nested(user_fields),
            'content': fields.String,
        }))
    }), attribute='comments2'),
    # TODO: only return the circles that the seeing user is in
    'circles': fields.List(fields.Nested({
        # not using circle_fields because not exposing what members a circle has
        'id': fields.String(attribute='eid'),
        'name': fields.String,
    }))
}


post_parser = reqparse.RequestParser()
post_parser.add_argument('content', type=str, required=False)
post_parser.add_argument('is_public', type=bool, required=True)
post_parser.add_argument('circle_ids', type=str, action="append", default=[])
post_parser.add_argument('reshareable', type=bool, required=True)
post_parser.add_argument('reshared_from', type=str, required=False)
post_parser.add_argument('media_object_names', type=str, action="append", default=[])
post_parser.add_argument('mentioned_user_ids', type=str, action='append', default=[])


class Posts(Resource):
    @jwt_required()
    def post(self):
        """
        Creates a new post
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        args = post_parser.parse_args()

        # check circles
        circles = []
        for circle_id in args['circle_ids']:
            found_circle = find_circle(user, circle_id)
            if not found_circle:
                return {'msg': f'Circle {circle_id} is not found'}, 404
            circles.append(found_circle)

        # check reshare
        reshared_from = args['reshared_from']
        reshared_from_post = None
        if reshared_from:
            reshared_from_post = get_post(reshared_from)
            if not reshared_from_post:
                return {"msg": f"Post {reshared_from} is not found"}, 404

        # check media
        media_object_names = args['media_object_names']
        if reshared_from and media_object_names:
            return {'msg': "Reshared post is not allowed to have media"}, 400
        media_objects = []
        for media_object_name in media_object_names:
            media_object = get_media(media_object_name)
            if not media_object:
                return {"msg": f"Media {media_object_name} is not found"}, 404
            media_objects.append(media_object)

        post_id = create_post(
            user,
            content=args['content'],
            is_public=args['is_public'],
            circles=circles,
            reshareable=args['reshareable'],
            reshared_from=reshared_from_post,
            media_list=media_objects,
            mentioned_users=check_mentioned_user_ids(args['mentioned_user_ids'])
        )
        if not post_id:
            return {"msg": f"Not allowed to reshare post {reshared_from}"}, 403
        return {'id': post_id}, 201


post_media_parser = reqparse.RequestParser()
for i in range(MaxPostMediaCount):
    post_media_parser.add_argument('media' + str(i), type=werkzeug.datastructures.FileStorage, location='files',
                                   required=False, default=None)


class PostMedia(Resource):
    @jwt_required()
    def post(self):
        args = post_media_parser.parse_args()
        media_files = []
        for i in range(MaxPostMediaCount):
            media_file = args['media' + str(i)]
            if media_file:
                media_files.append(media_file)
        media_object_names = []
        for media_file in media_files:
            object_name_stem = f"media/{uuid.uuid4()}"
            media_object = upload_to_s3(media_file, object_name_stem)
            if not media_object:
                return {'msg': f"Disallowed image type"}, 400
            media_object_names.append(media_object.id)

        return media_object_names, 201


class Home(Resource):
    @jwt_required()
    @marshal_with(post_fields)
    def get(self):
        """
        Get posts that are visible to the current user
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)

        args = pagination_parser.parse_args()
        posts = retrieves_posts_on_home(user, args['from_id'])

        return posts, 200


class Post(Resource):
    @jwt_required()
    @marshal_with(post_fields)
    def get(self, post_id: str):
        user_id = get_jwt_identity()
        user = find_user(user_id)

        post = get_post(post_id)
        if not sees_post(user, post, context_home_or_profile=False):
            return {'msg': 'Do not have permission to see the post'}, 403
        return post


class Profile(Resource):
    @jwt_required()
    @marshal_with(post_fields)
    def get(self, profile_user_id):
        """
        Get a user's posts on profile
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)

        profile_user = find_user(profile_user_id)
        if not profile_user:
            return {'msg': f'User {profile_user_id} is not found'}, 404

        args = pagination_parser.parse_args()
        return retrieves_posts_on_profile(user, profile_user, args['from_id'])
