from flask_restful import Resource, marshal_with
from flask_jwt_extended import jwt_required, get_jwt_identity
from mini_gplus.daos.user import get_users, find_user
from .me import user_fields


class Users(Resource):
    @jwt_required()
    @marshal_with(user_fields)
    def get(self):
        """
        Get all users other than the logged in user
        """
        user_id = get_jwt_identity()
        # TODO: pretty inefficient because all Users needs to call get user by oid once more lol
        return get_users(user_id), 200


class User(Resource):
    @jwt_required()
    @marshal_with(user_fields)
    def get(self, user_id):
        """
        Get a specific user by ID
        """
        user = find_user(user_id)
        if not user:
            return {'msg': f'User {user_id} is not found'}, 404
        return user
