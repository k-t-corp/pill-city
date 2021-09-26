from mini_gplus.models import Notification
from .post import get_post
from .reaction import get_reaction
from .comment import dangerously_get_comment


def _href_to_summary(href: str) -> str:
    if '#reaction-' in href:
        reaction_id = href.split('#reaction-')[1]
        post_id = href.split("#reaction-")[0].split('/post/')[1]
        post = get_post(post_id)
        reaction = get_reaction(reaction_id, post)
        return reaction.emoji if reaction else ''
    elif '#comment-' in href:
        comment_id = href.split('#comment-')[1]
        post_id = href.split("#comment-")[0].split('/post/')[1]
        post = get_post(post_id)
        return dangerously_get_comment(comment_id, post).content
    elif '/post/' in href:
        post_id = href.split('/post/')[1]
        return get_post(post_id).content
    else:
        return ''


def backfill_notification_href_summaries():
    for notification in Notification.objects():
        notification.notifying_summary = _href_to_summary(notification.notifying_href)
        notification.notified_summary = _href_to_summary(notification.notified_href)
        notification.save()
