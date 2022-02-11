from flask_restful import Resource, fields, marshal_with, reqparse
from flask_jwt_extended import jwt_required
from pillcity.daos.link_preview import get_link_preview


link_preview_parser = reqparse.RequestParser()
link_preview_parser.add_argument('url', type=str, required=True)


class LinkPreviewState(fields.Raw):
    def format(self, state):
        return state.value


link_preview_fields = {
    'url': fields.String,
    'title': fields.String,
    'subtitle': fields.String,
    'image_urls': fields.List(fields.String),
    'state': LinkPreviewState
}


class LinkPreview(Resource):
    @jwt_required()
    @marshal_with(link_preview_fields)
    def post(self):
        args = link_preview_parser.parse_args()
        return get_link_preview(args['url'])
