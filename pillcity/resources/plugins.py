from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from pillcity.daos.user import find_user_or_raise


class Plugins(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = find_user_or_raise(user_id)

        return []
