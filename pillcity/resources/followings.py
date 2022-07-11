from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from pillcity.daos.user import find_user_or_raise, follow, unfollow


class Following(Resource):
    @jwt_required()
    def post(self, following_user_id):
        """
        Follow a user
        """
        user_id = get_jwt_identity()
        user = find_user_or_raise(user_id)
        target_user = find_user_or_raise(following_user_id)
        follow(user, target_user)

    @jwt_required()
    def delete(self, following_user_id):
        """
        Unfollow a user
        """
        user_id = get_jwt_identity()
        user = find_user_or_raise(user_id)
        target_user = find_user_or_raise(following_user_id)
        unfollow(user, target_user)
