from typing import List
from mini_gplus.models import NotifyingAction, User
from .notification import create_notification


def mention(self: User, notified_href: str, mentioned_users: List[User]):
    """
    Create the notifications for mentioning a list of user

    :param self: The acting user
    :param notified_href: The notifying href
    :param mentioned_users: The mentioned users
    """
    for mentioned_user in mentioned_users:
        create_notification(
            self=self,
            notifying_href='',
            notifying_action=NotifyingAction.Mention,
            notified_href=notified_href,
            owner=mentioned_user
        )
