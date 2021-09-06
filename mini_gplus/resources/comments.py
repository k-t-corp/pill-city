from flask_restful import reqparse, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from mini_gplus.daos.user import find_user
from mini_gplus.daos.post import get_post
from mini_gplus.daos.comment import create_comment, create_nested_comment, get_comment


comment_parser = reqparse.RequestParser()
comment_parser.add_argument('content', type=str, required=True)


class Comments(Resource):
    @jwt_required()
    def post(self, post_id: str):
        """
        Creates a new comment to a post
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        post = get_post(post_id)
        comment_args = comment_parser.parse_args()
        comment_id = create_comment(user, comment_args['content'], post)
        return {'id': comment_id}, 201


class NestedComments(Resource):
    @jwt_required()
    def post(self, post_id: str, comment_id: str):
        """
        Creates a nested comment to a comment
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        post = get_post(post_id)
        comment = get_comment(comment_id)
        if comment not in post.comments:
            return {'msg': 'Cannot nest more than two levels of comment'}, 403
        nested_comment_args = comment_parser.parse_args()
        create_nested_comment(user, nested_comment_args['content'], comment, post)