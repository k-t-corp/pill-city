from flask_restful import Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from pillcity.daos.user import find_user_or_raise
from pillcity.daos.post import dangerously_get_post
from pillcity.daos.poll import vote
from .users import user_fields
from .media import MediaUrlV2

poll_fields = {
    'choices': fields.List(fields.Nested({
        'id': fields.String(attribute='eid'),
        'content': fields.String,
        "media_url_v2": MediaUrlV2(attribute='media'),
        'voters': fields.List(fields.Nested(user_fields))
    })),
    'close_by_seconds': fields.Integer(attribute='close_by')
}


class Vote(Resource):
    @jwt_required()
    def post(self, post_id: str, choice_id: str):
        user_id = get_jwt_identity()
        user = find_user_or_raise(user_id)
        post = dangerously_get_post(post_id)

        vote(user, post, choice_id)
