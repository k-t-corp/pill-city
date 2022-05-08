from pillcity.models import User, Post
from .post import sees_post
from .exceptions import UnauthorizedAccess, BadRequest


def vote(self: User, parent_post: Post, choice_id: str):
    """
    Cast a vote on a post poll
    It also removes the user from an existing choice if there is one

    :param self: The acting user
    :param parent_post: The post that contains the poll
    :param choice_id: The ID for the poll choice
    """
    if parent_post.deleted:
        raise UnauthorizedAccess()
    if not sees_post(self, parent_post, context_home_or_profile=False):
        raise UnauthorizedAccess()
    if not parent_post.poll:
        raise BadRequest()

    existing_choice_id = None
    for c in parent_post.poll.choices:
        if self in c.voters:
            existing_choice_id = c.eid
            break

    if choice_id == existing_choice_id:
        raise BadRequest()

    for c in parent_post.poll.choices:
        if c.eid == existing_choice_id:
            c.voters.remove(self)
        if c.eid == choice_id:
            c.voters.append(self)

    parent_post.save()
