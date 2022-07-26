from typing import List, Optional
from pillcity.models import Notification, User, NotifyingAction
from pillcity.utils.make_uuid import make_uuid
from .pagination import get_page, poll_latest


NotificationPageSize = 10


def create_notification(
        self: User,
        notifying_href: str,
        notifying_summary: str,
        notifying_action: NotifyingAction,
        notified_href: str,
        notified_summary: str,
        owner: User
):
    """
    Create a notification where the notifier is the user. If the user is the owner, then do nothing
    Hrefs can be
        1) Link to post, e.g. /post/post-id
        2) Link to comment or nested comment, e.g. /post/post-id#comment-comment-id
        3) Link to reaction, e.g. /post/post-id#reaction-reaction-id

    :param self: The acting user
    :param notifying_href: href for the object that triggers this notification
                                    e.g. if the user creates a comment A on post B,
                                    then notifying_href is /post/B#comment-A
    :param notifying_summary: Text summary for the notifying href
    :param notifying_action: the specific action for the notification
    :param notified_href: href for the object that triggers this notification
                                    e.g. if the user creates a comment A on post B,
                                    then notifying_href is /post/A
    :param notified_summary: Text summary for the notified href
    :param owner: The user who is notified
    """
    if self.id == owner.id:
        return
    if self in owner.blocking:
        return
    new_notification = Notification()
    new_notification.eid = make_uuid()
    new_notification.notifier = self
    new_notification.notifying_href = notifying_href
    new_notification.notifying_summary = notifying_summary
    new_notification.notifying_action = notifying_action
    new_notification.notified_href = notified_href
    new_notification.notified_summary = notified_summary
    new_notification.owner = owner
    new_notification.save()


def get_notifications(self: User, from_id: Optional[str], count: int = NotificationPageSize) -> List[Notification]:
    """
    Get all of a user's notifications in reverse chronological order, e.g. latest to earliest

    :param (User) self: The acting user
    :param (str|None) from_id: The acting Post_id from which home posts should be retrieved
    :param (int) count: Number of notifications to return
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
        page_count=count
    )


def poll_notifications(self: User, to_id: str) -> List[Notification]:
    """
    Poll notifications since the to_id Notification, reverse chronologically ordered

    :param self: The acting user
    :param to_id: The notification ID to which notifications should be polled
    :return: All notifications since the to_id Notification, reverse chronologically ordered
    """
    def _filter_noop(_):
        return True

    return poll_latest(
        mongoengine_model=Notification,
        extra_query_args={
            'owner': self
        },
        extra_filter_func=_filter_noop,
        to_id=to_id
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


def nullify_notifications(href: str, ghost_user: User):
    """
    "Nullify" (e.g. clean information) notifications by href

    :param href: The nullified href
    :param ghost_user: The "ghost" user to assign notifier or owner to
    """
    for n in Notification.objects(notifying_href=href):
        n.notifier = ghost_user
        n.notifying_summary = ''
        n.notifying_deleted = True
        n.save()
    for n in Notification.objects(notified_href=href):
        if n.notifying_action != NotifyingAction.Mention:
            # In non mentioning case, notified location is owned by owner, hence set owner to ghost
            n.owner = ghost_user
        else:
            # In mentioning case, notified location is owned by notifier, hence set notifier to ghost
            # See mention.py
            n.notifier = ghost_user
        n.notified_summary = ''
        n.notified_deleted = True
        n.save()
