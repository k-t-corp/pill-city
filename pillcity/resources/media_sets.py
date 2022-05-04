from flask_restful import Resource, fields, marshal_with, reqparse
from flask_jwt_extended import jwt_required, get_jwt_identity
from pillcity.daos.media_set import create_media_set, get_media_sets, get_all_public_media_sets, \
    make_media_set_public, find_media_set, rename_media_set, delete_media_set, add_media_to_media_set, \
    remove_media_from_media_set
from pillcity.daos.user import find_user_or_raise
from pillcity.daos.media import get_media
from .users import user_fields
from .media import media_fields

media_set_fields = {
    'id': fields.String(attribute='eid'),
    'owner': fields.Nested(user_fields),
    'name': fields.String,
    'media_list': fields.List(fields.Nested(media_fields)),
    'is_public': fields.Boolean()
}

create_media_set_parser = reqparse.RequestParser()
create_media_set_parser.add_argument('name', type=str, required=True)

get_media_set_parser = reqparse.RequestParser()
get_media_set_parser.add_argument('mine', type=str, required=True, location='args')

rename_media_set_parser = reqparse.RequestParser()
rename_media_set_parser.add_argument('name', type=str, required=True)


class MediaSets(Resource):
    @jwt_required()
    def post(self):
        user = find_user_or_raise(get_jwt_identity())
        args = create_media_set_parser.parse_args()
        media_set_id = create_media_set(user, args['name'])
        return {'id': media_set_id}, 201

    @jwt_required()
    @marshal_with(media_set_fields)
    def get(self):
        user_id = get_jwt_identity()
        user = find_user_or_raise(user_id)
        args = get_media_set_parser.parse_args()
        if args['mine'] == '1':
            return get_media_sets(user)
        else:
            return get_all_public_media_sets(user)


class MediaSetName(Resource):
    @jwt_required()
    def patch(self, media_set_id: str):
        user_id = get_jwt_identity()
        user = find_user_or_raise(user_id)
        ms = find_media_set(user, media_set_id)
        args = create_media_set_parser.parse_args()
        rename_media_set(user, ms, args['name'])


class MediaSetPublic(Resource):
    @jwt_required()
    def patch(self, media_set_id: str):
        user_id = get_jwt_identity()
        user = find_user_or_raise(user_id)
        ms = find_media_set(user, media_set_id)
        make_media_set_public(user, ms)


media_set_media_args = reqparse.RequestParser()
media_set_media_args.add_argument('object_name', type=str, required=True)


class MediaSetMedia(Resource):
    @jwt_required()
    def post(self, media_set_id: str):
        user_id = get_jwt_identity()
        user = find_user_or_raise(user_id)

        ms = find_media_set(user, media_set_id)
        args = media_set_media_args.parse_args()
        object_name = args['object_name']
        m = get_media(object_name)

        if add_media_to_media_set(user, ms, m):
            return {'msg': 'Added'}, 201
        else:
            return {'msg': 'Media already exists in sticker pack'}, 409

    @jwt_required()
    def delete(self, media_set_id: str):
        user_id = get_jwt_identity()
        user = find_user_or_raise(user_id)

        ms = find_media_set(user, media_set_id)
        args = media_set_media_args.parse_args()
        object_name = args['object_name']
        m = get_media(object_name)

        remove_media_from_media_set(user, ms, m)


class MediaSet(Resource):
    @jwt_required()
    def delete(self, media_set_id: str):
        user_id = get_jwt_identity()
        user = find_user_or_raise(user_id)
        ms = find_media_set(user, media_set_id)
        delete_media_set(user, ms)
