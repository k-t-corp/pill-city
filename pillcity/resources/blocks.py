from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from pillcity.daos.user import find_user_or_raise, block, unblock


class Blocks(Resource):
    @jwt_required()
    def post(self, blocking_user_id):
        """
        Block a user
        """
        user_id = get_jwt_identity()
        user = find_user_or_raise(user_id)
        target_user = find_user_or_raise(blocking_user_id)
        block(user, target_user)

    @jwt_required()
    def delete(self, blocking_user_id):
        """
        Unblock a user
        """
        user_id = get_jwt_identity()
        user = find_user_or_raise(user_id)
        target_user = find_user_or_raise(blocking_user_id)
        unblock(user, target_user)
