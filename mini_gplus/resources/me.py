import os
import time
import werkzeug
from flask_restful import reqparse, Resource, fields, marshal_with
from flask_jwt_extended import jwt_required, get_jwt_identity
from mini_gplus.daos.user import find_user, update_profile_pic, update_avatar
from .upload_to_s3 import upload_to_s3


class AvatarUrl(fields.Raw):
    def format(self, avatar):
        if not avatar:
            return None
        return f"{os.environ['CDN_URL']}/{avatar.object_name}"


user_fields = {
    'id': fields.String(attribute='user_id'),
    'created_at_seconds': fields.Integer(attribute='created_at'),
    'avatar_url': AvatarUrl(attribute='avatar'),
    'profile_pic': fields.String
}


class Me(Resource):
    @jwt_required()
    @marshal_with(user_fields)
    def get(self):
        user_id = get_jwt_identity()
        user = find_user(user_id)
        return user


user_avatar_parser = reqparse.RequestParser()
user_avatar_parser.add_argument('file', type=werkzeug.datastructures.FileStorage, location='files', required=True)


class MyAvatar(Resource):
    @jwt_required()
    def post(self):
        # check user
        user_id = get_jwt_identity()
        user = find_user(user_id)
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
            return {'msg': f"Disallowed image type"}, 400

        update_avatar(user, avatar_media)


class MyProfilePic(Resource):
    @jwt_required()
    def patch(self, user_profile_pic):
        """
        Update User profile pic
        """
        # check user
        user_id = get_jwt_identity()
        user = find_user(user_id)
        if not user:
            return {'msg': f'User {user_id} is not found'}, 404

        update_profile_pic(user, user_profile_pic)
