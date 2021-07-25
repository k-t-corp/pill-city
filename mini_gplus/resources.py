from flask_restful import reqparse, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import User


user_parser = reqparse.RequestParser()
user_parser.add_argument('id', type=str, required=True)
user_parser.add_argument('password', type=str, required=True)


class UserList(Resource):
    @jwt_required()
    def get(self):
        """
        Get all users other than the logged in user
        """
        user_id = get_jwt_identity()
        other_users = [
            {'id': user.user_id, 'createdAtSeconds': user.created_at_unix_seconds}
            for user in User.objects(user_id__ne=user_id)
        ]
        return other_users, 200


post_parser = reqparse.RequestParser()
post_parser.add_argument('content', type=str, required=True)


class PostList(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        user = User.find(user_id)

        args = post_parser.parse_args()
        user.create_post(
            content=args['content'],
            # TODO: change
            is_public=True,
            # TODO: change
            circles=[]
        )


class Me(Resource):
    def post(self):
        """
        Signs up a new user
        """
        args = user_parser.parse_args()
        successful = User.create(args['id'], args['password'])
        if successful:
            return {'id': args['id']}, 201
        else:
            return {'message': {'id': 'id is already taken'}}, 409

    @jwt_required()
    def get(self):
        """
        Get a user's own information
        """
        user_id = get_jwt_identity()
        return {'id': user_id}, 200
