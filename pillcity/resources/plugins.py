from flask_restful import Resource
from flask_jwt_extended import jwt_required
from pillcity.plugins import get_plugins


class Plugins(Resource):
    @jwt_required()
    def get(self):
        return list(get_plugins().keys())
