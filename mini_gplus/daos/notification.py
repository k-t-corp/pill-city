from mini_gplus.models import Notification


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
    new_notification.notifier = self
    new_notification.notifying_href = notifying_href
    new_notification.notifying_action = notifying_action
    new_notification.notified_href = notified_href
    new_notification.owner = owner
    new_notification.save()


def get_notifications(self):
    """
    Get all of a user's notifications in reverse chronological order, e.g. latest to earliest

    :param (User) self: The acting user
    """
    return list(reversed(sorted(Notification.objects(owner=self), key=lambda n: n.created_at)))
