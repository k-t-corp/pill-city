import bleach
from typing import List, Optional
from mini_gplus.models import Comment, NotifyingAction, User, Post
from mini_gplus.utils.make_uuid import make_uuid
from .exceptions import UnauthorizedAccess
from .post import sees_post
from .notification import create_notification
from .mention import mention


def create_comment(self: User, content: str, parent_post: Post, mentioned_users: List[User]) -> str:
    """
    Create a comment for the user

    :param self: The acting user
    :param content: the content
    :param parent_post: the post that this comment is attached to
    :param mentioned_users: list of mentioned users
    :return ID of the new comment
    """
    # context_home_or_profile=False because context_home_or_profile only affects public posts
    # and it is fine for someone who does not see a public post on his home
    # to be able to interact (comment, nested-comment, etc) with this post
    # e.g. context_home_or_profile is reduced to the most permissive because context_home_or_profile only affects
    # public posts
    if sees_post(self, parent_post, context_home_or_profile=False):
        new_comment = Comment()
        new_comment.eid = make_uuid()
        new_comment.author = self.id
        new_comment.content = bleach.clean(content)

        parent_post.comments2.append(new_comment)
        parent_post.save()

        create_notification(
            self,
            notifying_href=new_comment.make_href(parent_post),
            notifying_action=NotifyingAction.Comment,
            notified_href=parent_post.make_href(),
            owner=parent_post.author
        )

        mention(
            self,
            notified_href=new_comment.make_href(parent_post),
            mentioned_users=mentioned_users
        )

        return str(new_comment.eid)
    else:
        raise UnauthorizedAccess()


def create_nested_comment(self: User, content: str, parent_comment: Comment, parent_post: Post,
                          mentioned_users: List[User]) -> str:
    """
    Create a nested comment for the user

    :param self: The acting user
    :param content: the content
    :param parent_comment: the comment that this nested comment is attached to
    :param parent_post: the post that this comment is attached to
    :param mentioned_users: list of mentioned users
    :return ID of the new comment
    """
    # same explanation for context_home_or_profile=False
    if sees_post(self, parent_post, context_home_or_profile=False):
        new_comment = Comment()
        new_comment.eid = make_uuid()
        new_comment.author = self.id
        new_comment.content = bleach.clean(content)

        parent_comment.comments.append(new_comment)
        parent_post.save()

        create_notification(
            self,
            notifying_href=new_comment.make_href(parent_post),
            notifying_action=NotifyingAction.Comment,
            notified_href=parent_comment.make_href(parent_post),
            owner=parent_comment.author
        )

        mention(
            self,
            notified_href=new_comment.make_href(parent_post),
            mentioned_users=mentioned_users
        )

        return str(new_comment.eid)
    else:
        raise UnauthorizedAccess()


def get_comment(comment_id: str, parent_post: Post) -> Optional[Comment]:
    """
    Get a Comment by its ID

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
