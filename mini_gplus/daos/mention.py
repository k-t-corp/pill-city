from .notification import create_notification
from .user import find_user
from mini_gplus.models.notification import NotifyingAction


def mention(self, post_or_comment, mentioned_user_ids):
    for mentioned_user_id in mentioned_user_ids:
        mentioned_user = find_user(mentioned_user_id)
        if not mentioned_user:
            continue
        create_notification(
            self=self,
            notifying_href=post_or_comment.make_href(),
            notifying_action=NotifyingAction.Mention,
            notified_href='',
            owner=mentioned_user
        )
