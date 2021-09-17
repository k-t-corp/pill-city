from flask_restful import reqparse, Resource, fields, marshal_with
from flask_jwt_extended import jwt_required, get_jwt_identity
from mini_gplus.daos.user import find_user
from mini_gplus.daos.post import get_post
from mini_gplus.daos.comment import create_comment, create_nested_comment, get_comment
from .mention import check_mentioned_user_ids
from .me import user_fields


comment_parser = reqparse.RequestParser()
comment_parser.add_argument('content', type=str, required=True)
comment_parser.add_argument('mentioned_user_ids', type=str, action='append', default=[])

nested_comment_fields = {
    'id': fields.String(attribute='eid'),
    'created_at_seconds': fields.Integer(attribute='created_at'),
    'author': fields.Nested(user_fields),
    'content': fields.String,
}

comment_fields = dict({
    'comments': fields.List(fields.Nested(nested_comment_fields))
}, **nested_comment_fields)


class Comments(Resource):
    @jwt_required()
    @marshal_with(comment_fields)
    def post(self, post_id: str):
        """
        Creates a new comment to a post
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        post = get_post(post_id)

        args = comment_parser.parse_args()
        comment = create_comment(user, args['content'], post, check_mentioned_user_ids(args['mentioned_user_ids']))
        return comment, 201


class NestedComments(Resource):
    @jwt_required()
    @marshal_with(nested_comment_fields)
    def post(self, post_id: str, comment_id: str):
        """
        Creates a nested comment to a comment
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        post = get_post(post_id)
        comment = get_comment(comment_id, post)
        if not post.comments2.filter(eid=comment.eid):
            return {'msg': 'Cannot nest more than two levels of comment'}, 403

        args = comment_parser.parse_args()
        nested_comment = create_nested_comment(user, args['content'], comment, post, check_mentioned_user_ids(args['mentioned_user_ids']))
        return nested_comment, 201
