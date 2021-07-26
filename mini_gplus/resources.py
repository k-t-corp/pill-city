from flask_restful import reqparse, Resource, fields, marshal_with
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import User, Post, Comment

###
# User
###

user_parser = reqparse.RequestParser()
user_parser.add_argument('id', type=str, required=True)
user_parser.add_argument('password', type=str, required=True)

user_fields = {
    'id': fields.String(attribute='user_id'),
    'created_at_seconds': fields.Integer(attribute='created_at')
}


class Users(Resource):
    @jwt_required()
    @marshal_with(user_fields)
    def get(self):
        """
        Get all users other than the logged in user
        """
        user_id = get_jwt_identity()
        other_users = [_ for _ in User.objects(user_id__ne=user_id)]
        return other_users, 200


###
# Circle
###

circle_parser = reqparse.RequestParser()
circle_parser.add_argument('name', type=str, required=True)

circle_fields = {
    'owner': fields.Nested(user_fields),
    'name': fields.String,
    'members': fields.List(fields.Nested(user_fields))
}


class Circles(Resource):
    @jwt_required()
    def post(self):
        """
        Create a new circle
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)

        circle_args = circle_parser.parse_args()
        if user.create_circle(circle_args['name']):
            return {'name': circle_args['name']}, 201
        else:
            return {'msg': {'name': 'name is already taken'}}, 409

    @jwt_required()
    @marshal_with(circle_fields)
    def get(self):
        """
        Get a user's circles
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        circles = user.get_circles()
        return circles, 200


class Circle(Resource):
    @jwt_required()
    @marshal_with(circle_fields)
    def get(self, circle_name: str):
        """
        Get a user's circle by name
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        found_circle = user.find_circle(circle_name)
        if found_circle:
            return found_circle, 200
        else:
            return {'msg': {'name': f'circle {circle_name} is not found'}}, 404


class CircleMember(Resource):
    @jwt_required()
    def post(self, circle_name: str, member_user_id: str):
        """
        Add a user to a circle
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        circle = user.find_circle(circle_name)
        if not circle:
            return {'msg': {'name': f'circle {circle_name} is not found'}}, 404
        member_user = User.find(member_user_id)
        if member_user in circle.members:
            return {'msg': {'members': f'member {member_user_id} is already in circle {circle_name}'}}, 409
        user.toggle_member(circle, member_user)

    @jwt_required()
    def delete(self, circle_name: str, member_user_id: str):
        """
        Remove a user from a circle
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        circle = user.find_circle(circle_name)
        if not circle:
            return {'msg': {'name': f'circle {circle_name} is not found'}}, 404
        member_user = User.find(member_user_id)
        if member_user not in circle.members:
            return {'msg': {'members': f'member {member_user_id} is already not in circle {circle_name}'}}, 409
        user.toggle_member(circle, member_user)


########
# Post #
########

post_parser = reqparse.RequestParser()
post_parser.add_argument('content', type=str, required=True)

post_fields = {
    'id': fields.String,
    'created_at_seconds': fields.Integer(attribute='created_at'),
    'author': fields.Nested(user_fields),
    'content': fields.String,
    'is_public': fields.Boolean,
    'reactions': fields.List(fields.Nested({
        'emoji': fields.String
    })),
    'circles': fields.List(fields.Nested(circle_fields)),
    'comments': fields.List(fields.Nested({
        'id': fields.String,
        'created_at_seconds': fields.Integer(attribute='created_at'),
        'author': fields.Nested(user_fields),
        'content': fields.String,
        # we only assume two-levels of nesting for comments, so no need to recursively define comments fields
        'comments': fields.List(fields.Nested({
            'id': fields.String,
            'created_at_seconds': fields.Integer(attribute='created_at'),
            'author': fields.Nested(user_fields),
            'content': fields.String,
        }))
    }))
}


class Posts(Resource):
    @jwt_required()
    def post(self):
        """
        Creates a new post
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)

        args = post_parser.parse_args()
        user.create_post(
            content=args['content'],
            # TODO: change
            is_public=True,
            # TODO: change
            circles=[]
        )

    @jwt_required()
    @marshal_with(post_fields)
    def get(self):
        """
        Get posts that are visible to the current user
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)

        posts = user.sees_posts()
        return posts, 200


############
# Comments #
############

comment_parser = reqparse.RequestParser()
comment_parser.add_argument('content', type=str, required=True)


class Comments(Resource):
    @jwt_required()
    def post(self, post_id: str):
        """
        Creates a new comment to a post
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        post = Post.objects.get(id=post_id)
        comment_args = comment_parser.parse_args()
        user.create_comment(comment_args['content'], post)

###################
# Nested comments #
###################


class NestedComments(Resource):
    @jwt_required()
    def post(self, post_id: str, comment_id: str):
        """
        Creates a nested comment to a comment
        """
        user_id = get_jwt_identity()
        user = User.find(user_id)
        post = Post.objects.get(id=post_id)
        comment = Comment.objects.get(id=comment_id)
        if comment not in post.comments:
            return {'msg': 'Cannot nest more than two levels of comment'}, 403
        nested_comment_args = comment_parser.parse_args()
        user.create_nested_comment(nested_comment_args['content'], comment, post)

######
# Me #
######


class Me(Resource):
    def post(self):
        """
        Signs up a new user
        """
        args = user_parser.parse_args()
        successful = User.create(args['id'], args['password'])
        if successful:
            return {'id': args['id']}, 201
        else:
            return {'msg': {'id': 'id is already taken'}}, 409

    @jwt_required()
    def get(self):
        """
        Get a user's own information
        """
        user_id = get_jwt_identity()
        return {'id': user_id}, 200
