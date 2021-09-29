import bleach
from typing import List, Optional
from mini_gplus.models import Comment, NotifyingAction, User, Post, Notification
from mini_gplus.utils.make_uuid import make_uuid
from mini_gplus.utils.now_ms import now_seconds
from .exceptions import UnauthorizedAccess
from .post import sees_post
from .post_cache import set_in_post_cache, exists_in_post_cache
from .notification import create_notification, nullify_notifications
from .mention import mention
from .user import find_ghost_user_or_raise


def create_comment(self: User, content: str, parent_post: Post, parent_comment: Optional[Comment], mentioned_users: List[User]) -> Optional[Comment]:
    """
    Create a comment for the user

    :param self: The acting user
    :param content: the content
    :param parent_post: the post that this comment is attached to
    :param parent_comment: The comment that this (maybe) nested comment is attached to
    :param mentioned_users: list of mentioned users
    :return The new comment object
    """
    # context_home_or_profile=False because context_home_or_profile only affects public posts
    # and it is fine for someone who does not see a public post on his home
    # to be able to interact (comment, nested-comment, etc) with this post
    # e.g. context_home_or_profile is reduced to the most permissive because context_home_or_profile only affects
    # public posts
    if not sees_post(self, parent_post, context_home_or_profile=False):
        raise UnauthorizedAccess()
    if parent_comment and parent_comment.deleted:
        raise UnauthorizedAccess()
    if parent_post.deleted:
        raise UnauthorizedAccess()

    new_comment = Comment()
    new_comment.eid = make_uuid()
    new_comment.author = self.id
    new_comment.content = bleach.clean(content)
    new_comment.created_at = now_seconds()

    if not parent_comment:
        parent_post.comments2.append(new_comment)
    else:
        parent_comment.comments.append(new_comment)
    parent_post.save()

    if not parent_comment:
        create_notification(
            self,
            notifying_href=new_comment.make_href(parent_post),
            notifying_summary=new_comment.content,
            notifying_action=NotifyingAction.Comment,
            notified_href=parent_post.make_href(),
            notified_summary=parent_post.content,
            owner=parent_post.author
        )
    else:
        create_notification(
            self,
            notifying_href=new_comment.make_href(parent_post),
            notifying_summary=new_comment.content,
            notifying_action=NotifyingAction.Comment,
            notified_href=parent_comment.make_href(parent_post),
            notified_summary=parent_comment.content,
            owner=parent_comment.author
        )

    mention(
        self,
        notified_href=new_comment.make_href(parent_post),
        notified_summary=new_comment.content,
        mentioned_users=mentioned_users
    )

    return new_comment


def dangerously_get_comment(comment_id: str, parent_post: Post) -> Optional[Comment]:
    """
    Get a Comment by its ID without checking permission
    We don't need to check permission here because this method is only used internally
        e.g. Not exposed to an API

    :param comment_id: Comment ID
    :param parent_post: Parent post object
    :return: Comment object
    """
    for comment2 in parent_post.comments2:
        if comment2.eid == comment_id:
            return comment2
        for nested_comment in comment2.comments:
            if nested_comment.eid == comment_id:
                return nested_comment
    return None


def delete_comment(self: User, comment_id: str, parent_post: Post) -> Optional[Comment]:
    """
    Delete a comment by its ID

    :param self: The acting user
    :param comment_id: The comment ID
    :param parent_post: The parent post
    :return:
    """
    comment = dangerously_get_comment(comment_id, parent_post)
    if self != comment.author:
        raise UnauthorizedAccess()

    ghost_user = find_ghost_user_or_raise()
    nullify_notifications(comment.make_href(parent_post), ghost_user)

    comment.author = ghost_user
    comment.content = ''
    comment.deleted = True
    # TODO: remove media both on here and on media collection
    parent_post.save()

    if exists_in_post_cache(parent_post.id):
        # only set in post cache if it already exists
        # post cache should only have reshared posts so it should not cache any deleted post
        set_in_post_cache(parent_post)

    return comment
