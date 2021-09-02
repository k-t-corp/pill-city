import os
import time
import boto3
import werkzeug
import tempfile
import uuid
import json
from typing import Optional, Dict, Tuple
from PIL import Image, UnidentifiedImageError
from flask_restful import reqparse, Resource, fields, marshal_with
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import User, Media

WhitelistedImageTypes = ['gif', 'jpeg', 'bmp', 'png']
MaxPostMediaCount = 9
PostMediaUrlExpireSeconds = 900


################
# Upload to S3 #
################

sts_admin_s3 = boto3.client(
    's3',
    endpoint_url=os.environ['S3_ENDPOINT_URL'],
    region_name=os.environ.get('S3_REGION', ''),
    aws_access_key_id=os.environ['S3_ACCESS_KEY'],
    aws_secret_access_key=os.environ['S3_SECRET_KEY']
)
sts_admin = boto3.client(
    'sts',
    endpoint_url=os.environ['S3_ENDPOINT_URL'],
    region_name=os.environ.get('S3_REGION', ''),
    aws_access_key_id=os.environ['S3_ACCESS_KEY'],
    aws_secret_access_key=os.environ['S3_SECRET_KEY']
)

s3_bucket_name = os.environ['S3_BUCKET_NAME']


def upload_to_s3(file, object_name_stem) -> Optional[Media]:
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
    if img_type not in WhitelistedImageTypes:
        return None

    object_name = f"{object_name_stem}.{img_type}"

    # upload avatar
    sts_admin_s3.upload_file(
        Filename=temp_fp,
        Bucket=s3_bucket_name,
        Key=object_name,
        ExtraArgs={
            'ContentType': f"image/{img_type}",
        }
    )

    # update user model
    avatar_media = Media()
    avatar_media.object_name = object_name
    avatar_media.save()
    os.remove(temp_fp)

    return avatar_media


######
# Me #
######


class AvatarUrl(fields.Raw):
    def format(self, avatar):
        if not avatar:
            return None
        return f"{os.environ['CDN_URL']}/{avatar.object_name}"


user_parser = reqparse.RequestParser()
user_parser.add_argument('id', type=str, required=True)
user_parser.add_argument('password', type=str, required=True)

user_fields = {
    'id': fields.String(attribute='user_id'),
    'created_at_seconds': fields.Integer(attribute='created_at'),
    'avatar_url': AvatarUrl(attribute='avatar'),
    'profile_pic': fields.String
}

user_avatar_parser = reqparse.RequestParser()
user_avatar_parser.add_argument('file', type=werkzeug.datastructures.FileStorage, location='files', required=True)


class Me(Resource):
    @jwt_required()
    @marshal_with(user_fields)
    def get(self):
        user_id = get_jwt_identity()
        user = User.find(user_id)
        return user


class MyAvatar(Resource):
    @jwt_required()
    def post(self):
        # check user
        user_id = get_jwt_identity()
        user = User.find(user_id)
        if not user:
            return {'msg': f'User {user_id} is not found'}, 404
        args = user_avatar_parser.parse_args()
        file = args['file']

        # the resulting object name looks like avatars/kt-1627815711477.jpeg
        # avatars prefix is made explicitly public readable
        # because it's faster to read a user's metadata, and we are fine with all avatars being public
        object_name_stem = f"avatars/{user_id}-{str(time.time_ns() // 1_000_000)}"
        avatar_media = upload_to_s3(file, object_name_stem)
        if not avatar_media:
            return {'msg': f"Blacklisted image type"}, 400

        user.avatar = avatar_media
        user.save()


class MyProfilePic(Resource):
    @jwt_required()
    def patch(self, user_profile_pic):
        """
        Update User profile pic
        """
        # check user
        user_id = get_jwt_identity()
        user = User.find(user_id)
        if not user:
            return {'msg': f'User {user_id} is not found'}, 404

        user.update_profile_pic(user_profile_pic)


#########
# Users #
#########

class Users(Resource):
    @jwt_required()
    @marshal_with(user_fields)
    def get(self):
        """
        Get all users other than the logged in user
        """
        user_id = get_jwt_identity()
        other_users = [_ for _ in User.objects(user_id__ne=user_id)]
        return other_users, 200


class UserResource(Resource):
    @jwt_required()
    @marshal_with(user_fields)
    def get(self, user_id):
        """
        Get a specific user by ID
        """
        user = User.find(user_id)
        if not user:
            return {'msg': f'User {user_id} is not found'}, 404
        return user


##########
# Circle #
##########

circle_fields = {
    'owner': fields.Nested(user_fields),
    'name': fields.String,
    'members': fields.List(fields.Nested(user_fields))
}


class Circles(Resource):
    @jwt_required()
    @marshal_with(circle_fields)
    def get(self):
        """
        Get a user's circles
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        circles = user.get_circles()
        return circles, 200


class Circle(Resource):
    @jwt_required()
    def post(self, circle_name: str):
        """
        Create a new circle
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)

        if not user.create_circle(circle_name):
            return {'msg': f'Circle name {circle_name} is already taken'}, 409
        return {'name': circle_name}, 201

    @jwt_required()
    @marshal_with(circle_fields)
    def get(self, circle_name: str):
        """
        Get a user's circle by name
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        found_circle = user.find_circle(circle_name)
        if found_circle:
            return found_circle, 200
        else:
            return {'msg': f'Circle {circle_name} is not found'}, 404

    @jwt_required()
    def delete(self, circle_name: str):
        """
        Delete a user's circle by name
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        found_circle = user.find_circle(circle_name)
        if not found_circle:
            return {'msg': f'Circle {circle_name} is not found'}, 404
        user.delete_circle(found_circle)


class CircleMember(Resource):
    @jwt_required()
    def post(self, circle_name: str, member_user_id: str):
        """
        Add a user to a circle
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        circle = user.find_circle(circle_name)
        if not circle:
            return {'msg': f'Circle {circle_name} is not found'}, 404
        member_user = User.find(member_user_id)
        if member_user in circle.members:
            return {'msg': f'User {member_user_id} is already in circle {circle_name}'}, 409
        user.toggle_member(circle, member_user)

    @jwt_required()
    def delete(self, circle_name: str, member_user_id: str):
        """
        Remove a user from a circle
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        circle = user.find_circle(circle_name)
        if not circle:
            return {'msg': f'Circle {circle_name} is not found'}, 404
        member_user = User.find(member_user_id)
        if member_user not in circle.members:
            return {'msg': f'User {member_user_id} is already not in circle {circle_name}'}, 409
        user.toggle_member(circle, member_user)


#############
# Following #
#############

class Following(Resource):
    @jwt_required()
    def post(self, following_user_id):
        """
        Follow a user
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        target_user = User.find(following_user_id)
        if not target_user:
            return {'msg': f'User {following_user_id} is not found'}, 404
        if not user.add_following(target_user):
            return {'msg': f"Already following user {following_user_id}"}, 409

    @jwt_required()
    def delete(self, following_user_id):
        """
        Unfollow a user
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        target_user = User.find(following_user_id)
        if not target_user:
            return {'msg': f'User {following_user_id} is not found'}, 404
        if not user.remove_following(target_user):
            return {'msg': f"Already not following user {following_user_id}"}, 409


class Followings(Resource):
    @jwt_required()
    @marshal_with(user_fields)
    def get(self):
        user_id = get_jwt_identity()
        user = User.find(user_id)
        return user.get_followings()


####################
# Post and profile #
####################

post_parser = reqparse.RequestParser()
post_parser.add_argument('content', type=str, required=True)
post_parser.add_argument('is_public', type=bool, required=True)
post_parser.add_argument('circle_names', type=str, action="append", default=[])
post_parser.add_argument('reshareable', type=bool, required=True)
post_parser.add_argument('reshared_from', type=str, required=False)
post_parser.add_argument('media_object_names', type=str, action="append", default=[])

# stores media object name -> (media url, media url generation time in ms epoch)
MediaUrlCache = {}  # type: Dict[str, Tuple[str, int]]


class MediaUrls(fields.Raw):
    def format(self, media_list):
        if not media_list:
            return []

        def get_media_url(media):
            object_name = media.object_name
            now_ms = time.time_ns() // 1_000_000
            # subtract expiry by 10 seconds for some network overhead
            if object_name in MediaUrlCache and now_ms < MediaUrlCache[object_name][1] + \
                    (PostMediaUrlExpireSeconds - 10) * 1000:
                return MediaUrlCache[object_name][0]

            # TODO: how would this work with an actual CDN e.g. cloudfront?

            # obtain temp token
            read_media_policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "GetObject",
                        "Effect": "Allow",
                        "Action": "s3:GetObject",
                        "Resource": [f"arn:aws:s3:::{s3_bucket_name}/{object_name}"],
                    },
                ],
            }
            assume_role_response = sts_admin.assume_role(
                # for minio this is moot
                # for s3 this role allows all media read, but intersects with the inline policy, the temp role
                #    would still be minimal privilege
                RoleArn=os.environ['MEDIA_READER_ROLE_ARN'],
                RoleSessionName='read-media-' + object_name,
                Policy=json.dumps(read_media_policy),
                DurationSeconds=PostMediaUrlExpireSeconds,
            )
            temp_s3_client = boto3.client(
                's3',
                endpoint_url=os.environ['S3_ENDPOINT_URL'],
                region_name=os.environ.get('S3_REGION', ''),
                aws_access_key_id=assume_role_response['Credentials']['AccessKeyId'],
                aws_secret_access_key=assume_role_response['Credentials']['SecretAccessKey'],
                aws_session_token=assume_role_response['Credentials']['SessionToken'],
            )

            # get pre-signed url
            media_url = temp_s3_client.generate_presigned_url(
                ClientMethod='get_object',
                Params={'Bucket': s3_bucket_name, 'Key': media.object_name},
                ExpiresIn=PostMediaUrlExpireSeconds
            )

            MediaUrlCache[object_name] = (media_url, now_ms)
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
    }),
    'media_urls': MediaUrls(attribute='media_list'),
    'reactions': fields.List(fields.Nested({
        'id': fields.String(attribute='eid'),
        'emoji': fields.String,
        'author': fields.Nested(user_fields),
    })),
    # TODO: only return the circles that the seeing user is in
    'circles': fields.List(fields.Nested({
        # not using circle_fields because not exposing what members a circle has
        'name': fields.String,
    })),
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
    }))
}


class Posts(Resource):
    @jwt_required()
    def post(self):
        """
        Creates a new post
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        args = post_parser.parse_args()

        # check circles
        circles = []
        for circle_name in args['circle_names']:
            found_circle = user.find_circle(circle_name)
            if not found_circle:
                return {'msg': f'Circle {circle_name} is not found'}, 404
            circles.append(found_circle)

        # check reshare
        reshared_from = args['reshared_from']
        reshared_from_post = None
        if reshared_from:
            reshared_from_post = user.get_post(reshared_from)
            if not reshared_from_post:
                return {"msg": f"Post {reshared_from} is not found"}, 404

        # check media
        media_object_names = args['media_object_names']
        if reshared_from and media_object_names:
            return {'msg': "Reshared post is not allowed to have media"}, 400
        media_objects = []
        for media_object_name in media_object_names:
            media_object = Media.objects.get(object_name=media_object_name)
            if not media_object:
                return {"msg": f"Media {media_object_name} is not found"}, 404
            media_objects.append(media_object)

        post_id = user.create_post(
            content=args['content'],
            is_public=args['is_public'],
            circles=circles,
            reshareable=args['reshareable'],
            reshared_from=reshared_from_post,
            media_list=media_objects
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
                return {'msg': f"Blacklisted image type"}, 400
            media_object_names.append(media_object.object_name)

        return media_object_names, 201


class Home(Resource):
    @jwt_required()
    @marshal_with(post_fields)
    def get(self):
        """
        Get posts that are visible to the current user
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)

        posts = user.retrieves_posts_on_home()
        return posts, 200


class Post(Resource):
    @jwt_required()
    @marshal_with(post_fields)
    def get(self, post_id: str):
        user_id = get_jwt_identity()
        user = User.find(user_id)

        post = user.get_post(post_id)
        if not user.sees_post(post, context_home_or_profile=False):
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
        user = User.find(user_id)
        profile_user = User.find(profile_user_id)
        if not profile_user:
            return {'msg': f'User {profile_user_id} is not found'}, 404
        return user.retrieves_posts_on_profile(profile_user)


############
# Comments #
############

comment_parser = reqparse.RequestParser()
comment_parser.add_argument('content', type=str, required=True)


class Comments(Resource):
    @jwt_required()
    def post(self, post_id: str):
        """
        Creates a new comment to a post
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        post = user.get_post(post_id)
        comment_args = comment_parser.parse_args()
        comment_id = user.create_comment(comment_args['content'], post)
        return {'id': comment_id}, 201


###################
# Nested comments #
###################


class NestedComments(Resource):
    @jwt_required()
    def post(self, post_id: str, comment_id: str):
        """
        Creates a nested comment to a comment
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        post = user.get_post(post_id)
        comment = user.get_comment(comment_id)
        if comment not in post.comments:
            return {'msg': 'Cannot nest more than two levels of comment'}, 403
        nested_comment_args = comment_parser.parse_args()
        user.create_nested_comment(nested_comment_args['content'], comment, post)


#############
# Reactions #
#############

reaction_parser = reqparse.RequestParser()
reaction_parser.add_argument('emoji', type=str, required=True)


class Reactions(Resource):
    @jwt_required()
    def post(self, post_id: str):
        """
        Creates a new reaction to a post
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        post = user.get_post(post_id)
        if not post:
            return {"msg": "post is not found"}, 404
        reaction_args = reaction_parser.parse_args()
        reaction_id = user.create_reaction(reaction_args['emoji'], post)
        return {'id': reaction_id}, 201


class Reaction(Resource):
    @jwt_required()
    def delete(self, post_id: str, reaction_id: str):
        """
        Remove a reaction from a post
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        post = user.get_post(post_id)
        if not post:
            return {"msg": "post is not found"}, 404
        reaction_to_delete = user.get_reaction(reaction_id)
        if reaction_to_delete not in post.reactions:
            return {'msg': f'Reaction {reaction_to_delete} is already not in post {post_id}'}, 409
        user.delete_reaction(reaction_to_delete, post)
