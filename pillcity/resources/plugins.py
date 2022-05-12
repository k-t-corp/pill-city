from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required, get_jwt_identity
from pillcity.daos.user import find_user_or_raise


get_plugins_parser = reqparse.RequestParser()
get_plugins_parser.add_argument('mine', type=str, required=True, location='args')


class Plugins(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = find_user_or_raise(user_id)

        args = get_plugins_parser.parse_args()
        mine = args.get('mine')
        if mine not in {"1", "0"}:
            return {'msg': 'mine parameter should be either 1 or 0'}, 400
        mine = mine == '1'

        return []
