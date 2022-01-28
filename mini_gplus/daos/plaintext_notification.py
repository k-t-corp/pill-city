from mini_gplus.models import Notification, NotifyingAction, User
from .user_cache import get_in_user_cache_by_oid

# TODO: this is all duplicate with frontend lol
action_to_word = {
    NotifyingAction.Mention: 'mentioned',
    NotifyingAction.Reshare: 'reshared',
    NotifyingAction.Comment: 'commented',
    NotifyingAction.Reaction: 'reacted',
    NotifyingAction.Follow: 'followed',
}


def plaintext_user(user: User) -> str:
    if not user:
        return 'Someone'
    if user.display_name:
        return f'{user.display_name} (@{user.user_id})'
    return user.user_id


def plaintext_summary(s: str, length: int) -> str:
    if len(s) > length:
        return f"{s[: length]}..."
    return s


def plaintext_notification(notification: Notification) -> str:
    res = ''

    if notification.notifying_action != NotifyingAction.Mention:
        notifier = notification.notifier if not notification.notifying_deleted else None
    else:
        notifier = notification.notifier if not notification.notified_deleted else None
    if notifier:
        notifier = get_in_user_cache_by_oid(notifier.id)
        res += plaintext_user(notifier)
        res += ' '

    res += action_to_word.get(notification.notifying_action, '')
    res += ' '

    if notification.notifying_action in {NotifyingAction.Mention, NotifyingAction.Follow}:
        res += "you"
    else:
        res += '"'
        res += plaintext_summary(notification.notifying_summary, 150)
        res += '"'
    res += ' '

    if notification.notifying_action != NotifyingAction.Follow:
        if notification.notifying_action == NotifyingAction.Mention:
            pronoun = "their"
        else:
            pronoun = "your"
        location_type = ''
        if '#comment-' in notification.notified_href:
            location_type = 'comment'
        elif '/post/' in notification.notified_href:
            location_type = 'post'
        res += f'on {pronoun} {location_type}'

    return res.strip()
