import emoji as emoji_lib
from mini_gplus.models import Reaction, NotifyingAction
from .exceptions import UnauthorizedAccess, BadRequest, NotFound
from .make_uuid import make_uuid
from .post import sees_post
from .notification import create_notification


def create_reaction(self, emoji, parent_post):
    """
    Create a reaction for the user

    :param (User) self: The acting user
    :param (str) emoji: the emoji
    :param (Post) parent_post: the post that this reaction is attached to
    :return (str) ID of the new reaction
    :raise (UnauthorizedAccess) when access is unauthorized
    """
    if sees_post(self, parent_post, context_home_or_profile=False):
        for r in parent_post.reactions:
            if r.author.id == self.id and r.emoji == emoji:
                raise UnauthorizedAccess()

        if emoji_lib.emoji_count(emoji) != 1:
            raise BadRequest()

        new_reaction = Reaction()
        new_reaction.eid = make_uuid()
        new_reaction.author = self.id
        new_reaction.emoji = emoji
        new_reaction.save()

        parent_post.reactions.append(new_reaction)
        parent_post.save()

        create_notification(
            self,
            notifying_href=new_reaction.make_href(parent_post),
            notifying_action=NotifyingAction.Reaction,
            notified_href=parent_post.make_href(),
            owner=parent_post.author
        )

        return str(new_reaction.eid)
    else:
        raise UnauthorizedAccess()


def get_reaction(reaction_id):
    rs = Reaction.objects(eid=reaction_id)
    if not rs:
        return None
    return rs[0]


def owns_reaction(self, reaction):
    """
    Whether the user owns a reaction

    :param (User) self: The acting user
    :param (Reaction) reaction: the reaction
    :return (bool): whether the user owns a reaction
    """
    return self.id == reaction.author.id


def delete_reaction(self, reaction, parent_post):
    """
    Delete a reaction

    :param (User) self: The acting user
    :param (Reaction) reaction: the comment
    :param (Post) parent_post: reaction's parent post
    :raise (UnauthorizedAccess) when access is unauthorized
    """
    if owns_reaction(self, reaction):
        if reaction not in parent_post.reactions:
            raise NotFound()
        parent_post.reactions.remove(reaction)
        reaction.delete()
    else:
        raise UnauthorizedAccess()
