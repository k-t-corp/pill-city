import bleach
from mini_gplus.models import Comment, NotifyingAction
from mini_gplus.utils.make_uuid import make_uuid
from .exceptions import UnauthorizedAccess
from .post import sees_post
from .notification import create_notification


def create_comment(self, content, parent_post):
    """
    Create a comment for the user

    :param (User) self: The acting user
    :param (str) content: the content
    :param (Post) parent_post: the post that this comment is attached to
    :return (str) ID of the new comment
    :raise (UnauthorizedAccess) when access is unauthorized
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
        new_comment.save()

        parent_post.comments.append(new_comment)
        parent_post.save()

        create_notification(
            self,
            notifying_href=new_comment.make_href(parent_post),
            notifying_action=NotifyingAction.Comment,
            notified_href=parent_post.make_href(),
            owner=parent_post.author
        )

        return str(new_comment.eid)
    else:
        raise UnauthorizedAccess()


def create_nested_comment(self, content, parent_comment, parent_post):
    """
    Create a nested comment for the user

    :param (User) self: The acting user
    :param (str) content: the content
    :param (Comment) parent_comment: the comment that this nested comment is attached to
    :param (Post) parent_post: the post that this comment is attached to
    :return (str) ID of the new comment
    :raise (UnauthorizedAccess) when access is unauthorized
    """
    # same explanation for context_home_or_profile=False
    if sees_post(self, parent_post, context_home_or_profile=False):
        new_comment = Comment()
        new_comment.eid = make_uuid()
        new_comment.author = self.id
        new_comment.content = bleach.clean(content)
        new_comment.save()

        parent_comment.comments.append(new_comment)
        parent_comment.save()

        create_notification(
            self,
            notifying_href=new_comment.make_href(parent_post),
            notifying_action=NotifyingAction.Comment,
            notified_href=parent_comment.make_href(parent_post),
            owner=parent_comment.author
        )

        return str(new_comment.eid)
    else:
        raise UnauthorizedAccess()


def get_comment(comment_id):
    """
    Get a Comment by its ID
    """
    return Comment.objects.get(eid=comment_id)
