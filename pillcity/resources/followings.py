from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from pillcity.daos.user import find_user, follow, unfollow


class Following(Resource):
    @jwt_required()
    def post(self, following_user_id):
        """
        Follow a user
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        target_user = find_user(following_user_id)
        if not target_user:
            return {'msg': f'User {following_user_id} is not found'}, 404
        follow(user, target_user)

    @jwt_required()
    def delete(self, following_user_id):
        """
        Unfollow a user
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        target_user = find_user(following_user_id)
        if not target_user:
            return {'msg': f'User {following_user_id} is not found'}, 404
        unfollow(user, target_user)
