from flask_restful import reqparse, Resource, fields, marshal_with
from flask_jwt_extended import jwt_required, get_jwt_identity
from mini_gplus.daos.user import find_user
from mini_gplus.daos.post import dangerously_get_post
from mini_gplus.daos.comment import create_comment, dangerously_get_comment, delete_comment
from mini_gplus.daos.exceptions import UnauthorizedAccess
from .mention import check_mentioned_user_ids
from .users import user_fields
from .media import check_media_object_names, MediaUrls
from .s3 import delete_from_s3

MaxCommentMediaCount = 1

comment_parser = reqparse.RequestParser()
comment_parser.add_argument('content', type=str, required=True)
comment_parser.add_argument('mentioned_user_ids', type=str, action='append', default=[])
comment_parser.add_argument('media_object_names', type=str, action="append", default=[])

nested_comment_fields = {
    'id': fields.String(attribute='eid'),
    'created_at_seconds': fields.Integer(attribute='created_at'),
    'author': fields.Nested(user_fields),
    'content': fields.String,
    'deleted': fields.Boolean,
    'media_urls': MediaUrls(attribute='media_list'),
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
        post = dangerously_get_post(post_id)

        args = comment_parser.parse_args()
        comment = create_comment(
            user,
            content=args['content'],
            parent_post=post,
            parent_comment=None,
            mentioned_users=check_mentioned_user_ids(args['mentioned_user_ids']),
            media_list=check_media_object_names(args['media_object_names'], MaxCommentMediaCount)
        )
        return comment, 201


class Comment(Resource):
    @jwt_required()
    def delete(self, post_id: str, comment_id: str):
        user_id = get_jwt_identity()
        user = find_user(user_id)
        post = dangerously_get_post(post_id)

        comment = dangerously_get_comment(comment_id, post)
        if user != comment.author:
            raise UnauthorizedAccess()
        for m in comment.media_list:
            delete_from_s3(m)

        deleted_comment = delete_comment(user, comment_id, post)
        return {'id': deleted_comment.eid}, 201


class NestedComments(Resource):
    @jwt_required()
    @marshal_with(nested_comment_fields)
    def post(self, post_id: str, comment_id: str):
        """
        Creates a nested comment to a comment
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        post = dangerously_get_post(post_id)
        comment = dangerously_get_comment(comment_id, post)
        if not post.comments2.filter(eid=comment.eid):
            return {'msg': 'Cannot nest more than two levels of comment'}, 403

        args = comment_parser.parse_args()
        nested_comment = create_comment(
            user,
            content=args['content'],
            parent_post=post,
            parent_comment=comment,
            mentioned_users=check_mentioned_user_ids(args['mentioned_user_ids']),
            media_list=check_media_object_names(args['media_object_names'], MaxCommentMediaCount)
        )
        return nested_comment, 201


class NestedComment(Resource):
    @jwt_required()
    def delete(self, post_id: str, comment_id: str, nested_comment_id: str):
        user_id = get_jwt_identity()
        user = find_user(user_id)
        post = dangerously_get_post(post_id)

        nested_comment = dangerously_get_comment(nested_comment_id, post)
        if user != nested_comment.author:
            raise UnauthorizedAccess()
        for m in nested_comment.media_list:
            delete_from_s3(m)

        deleted_nested_comment = delete_comment(user, nested_comment_id, post)
        return {'id': deleted_nested_comment.eid}, 201
