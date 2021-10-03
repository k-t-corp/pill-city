from flask_restful import reqparse, Resource, fields, marshal_with, marshal
from flask_jwt_extended import jwt_required, get_jwt_identity
from mini_gplus.daos.user import find_user
from mini_gplus.daos.user_cache import get_in_user_cache_by_user_id
from mini_gplus.daos.circle import find_circle
from mini_gplus.daos.post import dangerously_get_post, create_post, sees_post, retrieves_posts_on_home, \
    retrieves_posts_on_profile, delete_post, delete_post_media
from mini_gplus.daos.post_cache import get_in_post_cache
from mini_gplus.daos.circle_cache import get_in_circle_cache
from mini_gplus.daos.exceptions import UnauthorizedAccess, BadRequest
from .users import user_fields
from .s3 import delete_from_s3
from .pagination import pagination_parser
from .mention import check_mentioned_user_ids
from .comments import comment_fields
from .media import check_media_object_names, MediaUrls

MaxPostMediaCount = 4


class ResharedFrom(fields.Raw):
    def format(self, value):
        if not value:
            return None
        oid = value.id
        post = get_in_post_cache(oid)
        # we are returning reshared post without reactions or comments
        # so no need to set cache when reactions or comments are updated for a reshared post
        return marshal(post, {
            'id': fields.String(attribute='eid'),
            'created_at_seconds': fields.Integer(attribute='created_at'),
            'author': fields.Nested(user_fields),
            'content': fields.String,
            'media_urls': MediaUrls(attribute='media_list'),
            'deleted': fields.Boolean
        })


class Circle(fields.Raw):
    def format(self, value):
        if not value:
            return None
        oid = value.id
        circle = get_in_circle_cache(oid)
        user_id = get_jwt_identity()
        user = get_in_user_cache_by_user_id(user_id)
        if user == circle.owner or user in circle.members:
            return marshal(circle, {
                # not using circle_fields because not exposing what members a circle has
                'id': fields.String(attribute='eid'),
                'name': fields.String,
            })
        return None


post_fields = {
    'id': fields.String(attribute='eid'),
    'created_at_seconds': fields.Integer(attribute='created_at'),
    'author': fields.Nested(user_fields),
    'content': fields.String,
    'is_public': fields.Boolean,
    'reshareable': fields.Boolean,
    'reshared_from': ResharedFrom(attribute='reshared_from'),
    'media_urls': MediaUrls(attribute='media_list'),
    'reactions': fields.List(fields.Nested({
        'id': fields.String(attribute='eid'),
        'emoji': fields.String,
        'author': fields.Nested(user_fields),
    }), attribute='reactions2'),
    'comments': fields.List(fields.Nested(comment_fields), attribute='comments2'),
    'circles': fields.List(Circle),
    'deleted': fields.Boolean,
}


post_parser = reqparse.RequestParser()
post_parser.add_argument('content', type=str, required=False)
post_parser.add_argument('is_public', type=bool, required=True)
post_parser.add_argument('circle_ids', type=str, action="append", default=[])
post_parser.add_argument('reshareable', type=bool, required=True)
post_parser.add_argument('reshared_from', type=str, required=False)
post_parser.add_argument('media_object_names', type=str, action="append", default=[])
post_parser.add_argument('mentioned_user_ids', type=str, action='append', default=[])


class Posts(Resource):
    @jwt_required()
    @marshal_with(post_fields)
    def post(self):
        """
        Creates a new post
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        args = post_parser.parse_args()

        # check circles
        circles = []
        for circle_id in args['circle_ids']:
            found_circle = find_circle(user, circle_id)
            if not found_circle:
                return {'msg': f'Circle {circle_id} is not found'}, 404
            circles.append(found_circle)

        # check reshare
        reshared_from = args['reshared_from']
        reshared_from_post = None
        if reshared_from:
            reshared_from_post = dangerously_get_post(reshared_from)
            if not reshared_from_post:
                return {"msg": f"Post {reshared_from} is not found"}, 404

        # check media
        media_object_names = args['media_object_names']
        if reshared_from and media_object_names:
            return {'msg': "Reshared post is not allowed to have media"}, 400

        post = create_post(
            user,
            content=args['content'],
            is_public=args['is_public'],
            circles=circles,
            reshareable=args['reshareable'],
            reshared_from=reshared_from_post,
            media_list=check_media_object_names(media_object_names, MaxPostMediaCount),
            mentioned_users=check_mentioned_user_ids(args['mentioned_user_ids'])
        )
        if not post:
            return {"msg": f"Not allowed to reshare post {reshared_from}"}, 403
        return post, 201


class Home(Resource):
    @jwt_required()
    @marshal_with(post_fields)
    def get(self):
        """
        Get posts that are visible to the current user
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)

        args = pagination_parser.parse_args()
        posts = retrieves_posts_on_home(user, args['from_id'])

        return posts, 200


class Post(Resource):
    @jwt_required()
    @marshal_with(post_fields)
    def get(self, post_id: str):
        user_id = get_jwt_identity()
        user = find_user(user_id)

        post = dangerously_get_post(post_id)
        if not sees_post(user, post, context_home_or_profile=False):
            return {'msg': 'Do not have permission to see the post'}, 403
        return post

    @jwt_required()
    def delete(self, post_id: str):
        user_id = get_jwt_identity()
        user = find_user(user_id)

        post = dangerously_get_post(post_id)
        if user != post.author:
            raise UnauthorizedAccess()
        for m in post.media_list:
            delete_from_s3(m)

        deleted_post = delete_post(user, post_id)
        return {'id': deleted_post.eid}, 201


class PostMedia(Resource):
    @jwt_required()
    def delete(self, post_id: str):
        user_id = get_jwt_identity()
        user = find_user(user_id)

        post = dangerously_get_post(post_id)
        if user != post.author:
            raise UnauthorizedAccess()
        if not post.content:
            # keep the criteria that a post has to have either content or media
            raise BadRequest()
        for m in post.media_list:
            delete_from_s3(m)

        deleted_post = delete_post_media(user, post_id)
        return {'id': deleted_post.eid}, 201


class Profile(Resource):
    @jwt_required()
    @marshal_with(post_fields)
    def get(self, profile_user_id):
        """
        Get a user's posts on profile
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)

        profile_user = find_user(profile_user_id)
        if not profile_user:
            return {'msg': f'User {profile_user_id} is not found'}, 404

        args = pagination_parser.parse_args()
        return retrieves_posts_on_profile(user, profile_user, args['from_id'])
