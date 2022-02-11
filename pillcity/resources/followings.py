from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from pillcity.daos.user import find_user, add_following, remove_following, is_following


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
        if not add_following(user, target_user):
            return {'msg': f"Already following user {following_user_id}"}, 409

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
        if not remove_following(user, target_user):
            return {'msg': f"Already not following user {following_user_id}"}, 409
