from pillcity.models import User, Post
from .post import sees_post
from .exceptions import UnauthorizedAccess, BadRequest
from .post_cache import set_in_post_cache, exists_in_post_cache


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

    for c in parent_post.poll.choices:
        if c.eid == choice_id:
            # this is the choice that the user casts
            if self not in c.voters:
                # the user hasn't picked this choice before
                c.voters.append(self)
            else:
                # the user has picked this choice before, remove instead
                c.voters.remove(self)
        elif self in c.voters:
            # this is not hte choice that the use casts but it's the choice before
            c.voters.remove(self)

    if exists_in_post_cache(parent_post.id):
        # only set in post cache if it already exists
        set_in_post_cache(parent_post)

    parent_post.save()
