from flask_restful import Resource, fields, marshal_with, reqparse
from flask_jwt_extended import jwt_required, get_jwt_identity
from mini_gplus.daos.user import find_user
from mini_gplus.daos.circle import create_circle, get_circles, find_circle, toggle_member, delete_circle
from .me import user_fields

circle_fields = {
    'id': fields.String(attribute='eid'),
    'owner': fields.Nested(user_fields),
    'name': fields.String,
    'members': fields.List(fields.Nested(user_fields))
}

circle_parser = reqparse.RequestParser()
circle_parser.add_argument('name')


class Circles(Resource):
    @jwt_required()
    @marshal_with(circle_fields)
    def get(self):
        """
        Get a user's circles
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        circles = get_circles(user)
        return circles, 200

    @jwt_required()
    def post(self):
        """
        Create a new circle
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)

        args = circle_parser.parse_args()
        circle_name = args['name']

        circle_id = create_circle(user, circle_name)
        if not circle_id:
            return {'msg': f'Circle name {circle_name} is already taken'}, 409
        return {'id': circle_id}, 201


class Circle(Resource):
    @jwt_required()
    @marshal_with(circle_fields)
    def get(self, circle_id: str):
        """
        Get a user's circle by ID
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        found_circle = find_circle(user, circle_id)
        if found_circle:
            return found_circle, 200
        else:
            return {'msg': f'Circle {circle_id} is not found'}, 404

    @jwt_required()
    def delete(self, circle_id: str):
        """
        Delete a user's circle by ID
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        found_circle = find_circle(user, circle_id)
        if not found_circle:
            return {'msg': f'Circle {circle_id} is not found'}, 404
        delete_circle(user, found_circle)


class CircleMember(Resource):
    @jwt_required()
    def post(self, circle_id: str, member_user_id: str):
        """
        Add a user to a circle
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        circle = find_circle(user, circle_id)
        if not circle:
            return {'msg': f'Circle {circle_id} is not found'}, 404
        member_user = find_user(member_user_id)
        if member_user in circle.members:
            return {'msg': f'User {member_user_id} is already in circle {circle_id}'}, 409
        toggle_member(user, circle, member_user)

    @jwt_required()
    def delete(self, circle_id: str, member_user_id: str):
        """
        Remove a user from a circle
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        circle = find_circle(user, circle_id)
        if not circle:
            return {'msg': f'Circle {circle_id} is not found'}, 404
        member_user = find_user(member_user_id)
        if member_user not in circle.members:
            return {'msg': f'User {member_user_id} is already not in circle {circle_id}'}, 409
        toggle_member(user, circle, member_user)
