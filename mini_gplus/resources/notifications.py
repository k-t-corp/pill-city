from flask_restful import Resource, fields, marshal_with
from flask_jwt_extended import jwt_required, get_jwt_identity
from mini_gplus.daos.reaction import get_reaction
from mini_gplus.daos.comment import get_comment
from mini_gplus.daos.post import get_post
from mini_gplus.daos.user import find_user
from mini_gplus.daos.notification import get_notifications, mark_notification_as_read, mark_all_notifications_as_read
from .me import user_fields


class NotifyingAction(fields.Raw):
    def format(self, notifying_action):
        return notifying_action.value


class NotificationLocation(fields.Raw):
    def format(self, href):
        if '#reaction-' in href:
            reaction_id = href.split('#reaction-')[1]
            return {
                'href': href,
                'summary': get_reaction(reaction_id).emoji
            }
        elif '#comment-' in href:
            comment_id = href.split('#comment-')[1]
            return {
                'href': href,
                'summary': get_comment(comment_id).content
            }
        elif '/post/' in href:
            post_id = href.split('/post/')[1]
            return {
                'href': href,
                'summary': get_post(post_id).content
            }
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
        return get_notifications(user)


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
