from mini_gplus.models import Notification
from mini_gplus.utils.make_uuid import make_uuid
from .pagination import get_page

NotificationPageSize = 10


def create_notification(self, notifying_href, notifying_action, notified_href, owner):
    """
    Create a notification where the notifier is the user. If the user is the owner, then do nothing
    Hrefs can be
        1) Link to post, e.g. /post/post-id
        2) Link to comment or nested comment, e.g. /post/post-id#comment-comment-id
        3) Link to reaction, e.g. /post/post-id#reaction-reaction-id

    :param (User) self: The acting user
    :param (str) notifying_href: href for the object that triggers this notification
                                    e.g. if the user creates a comment A on post B,
                                    then notifying_href is /post/B#comment-A
    :param (NotifyingAction) notifying_action: the specific action for the notification
    :param (str) notified_href: href for the object that triggers this notification
                                    e.g. if the user creates a comment A on post B,
                                    then notifying_href is /post/A
    :param (User) owner: The user who is notified
    """
    if self.id == owner.id:
        return
    new_notification = Notification()
    new_notification.eid = make_uuid()
    new_notification.notifier = self
    new_notification.notifying_href = notifying_href
    new_notification.notifying_action = notifying_action
    new_notification.notified_href = notified_href
    new_notification.owner = owner
    new_notification.save()


def get_notifications(self, from_id):
    """
    Get all of a user's notifications in reverse chronological order, e.g. latest to earliest

    :param (User) self: The acting user
    :param (str|None) from_id: The acting Post_id from which home posts should be retrieved
    """
    def _filter_noop(_):
        return True

    return get_page(
        mongoengine_model=Notification,
        extra_query_args={
            'owner': self
        },
        extra_filter_func=_filter_noop,
        from_id=from_id,
        page_count=NotificationPageSize
    )


def mark_notification_as_read(self, notification_id):
    """
    Mark a notification as read

    :param (User) self: The acting user.
    :param (str) notification_id: ID of the notification
    """
    n = Notification.objects.get(eid=notification_id)
    if self.id != n.owner.id:
        return False
    if not n.unread:
        return True
    n.unread = False
    n.save()
    return True


def mark_all_notifications_as_read(self):
    """
    Mark all user's notifications as read

    :param (User) self: The acting user.
    """
    for n in Notification.objects(owner=self, unread=True):
        n.unread = False
        n.save()
