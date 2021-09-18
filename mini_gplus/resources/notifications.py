from flask_restful import Resource, fields, marshal_with
from flask_jwt_extended import jwt_required, get_jwt_identity
from mini_gplus.daos.reaction import get_reaction
from mini_gplus.daos.comment import get_comment
from mini_gplus.daos.post import get_post
from mini_gplus.daos.user import find_user
from mini_gplus.daos.notification import get_notifications, mark_notification_as_read, mark_all_notifications_as_read
from .users import user_fields
from .pagination import pagination_parser


class NotifyingAction(fields.Raw):
    def format(self, notifying_action):
        return notifying_action.value


class NotificationLocation(fields.Raw):
    def format(self, href):
        if '#reaction-' in href:
            reaction_id = href.split('#reaction-')[1]
            post_id = href.split("#reaction-")[0].split('/post/')[1]
            post = get_post(post_id)
            reaction = get_reaction(reaction_id, post)
            return {
                'href': href,
                'summary': reaction.emoji if reaction else ''
            }
        elif '#comment-' in href:
            comment_id = href.split('#comment-')[1]
            post_id = href.split("#comment-")[0].split('/post/')[1]
            post = get_post(post_id)
            return {
                'href': href,
                'summary': get_comment(comment_id, post).content
            }
        elif '/post/' in href:
            post_id = href.split('/post/')[1]
            return {
                'href': href,
                'summary': get_post(post_id).content
            }
        elif href == '':
            return {}
        else:
            return {
                'error': f'Unknown href type for {href}'
            }


notification_fields = {
    'id': fields.String(attribute='eid'),
    'created_at_seconds': fields.Integer(attribute='created_at'),
    'notifier': fields.Nested(user_fields),
    'notifying_location': NotificationLocation(attribute='notifying_href'),
    'notifying_action': NotifyingAction,
    'notified_location': NotificationLocation(attribute='notified_href'),
    'unread': fields.Boolean
}


class Notifications(Resource):
    @jwt_required()
    @marshal_with(notification_fields)
    def get(self):
        """
        Get all of a user's notifications
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)

        args = pagination_parser.parse_args()
        return get_notifications(user, args['from_id'])


class NotificationRead(Resource):
    @jwt_required()
    def put(self, notification_id):
        """
        Mark a notification as read
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        if not mark_notification_as_read(user, notification_id):
            return {'msg': "Not allowed to mark notification as read"}, 401


class NotificationsAllRead(Resource):
    @jwt_required()
    def put(self):
        """
        Mark a user's all notifications as read
        """
        user_id = get_jwt_identity()
        user = find_user(user_id)
        mark_all_notifications_as_read(user)
