from flask_restful import reqparse, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from mini_gplus.daos.user import find_user
from mini_gplus.daos.post import get_post
from mini_gplus.daos.reaction import get_reaction, delete_reaction, create_reaction

reaction_parser = reqparse.RequestParser()
reaction_parser.add_argument('emoji', type=str, required=True)


class Reactions(Resource):
    @jwt_required()
    def post(self, post_id: str):
        """
        Creates a new reaction to a post
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        post = get_post(post_id)
        if not post:
            return {"msg": "post is not found"}, 404
        reaction_args = reaction_parser.parse_args()
        reaction_id = create_reaction(user, reaction_args['emoji'], post)
        return {'id': reaction_id}, 201


class Reaction(Resource):
    @jwt_required()
    def delete(self, post_id: str, reaction_id: str):
        """
        Remove a reaction from a post
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        post = get_post(post_id)
        if not post:
            return {"msg": "post is not found"}, 404
        reaction_to_delete = get_reaction(reaction_id)
        if reaction_to_delete not in post.reactions:
            return {'msg': f'Reaction {reaction_to_delete} is already not in post {post_id}'}, 409
        delete_reaction(user, reaction_to_delete, post)
