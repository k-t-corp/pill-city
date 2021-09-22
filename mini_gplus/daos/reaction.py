import emoji as emoji_lib
from typing import Optional
from mini_gplus.models import Reaction, NotifyingAction, Post, User
from mini_gplus.utils.make_uuid import make_uuid
from mini_gplus.utils.now_ms import now_seconds
from .exceptions import UnauthorizedAccess, BadRequest, NotFound
from .post import sees_post
from .notification import create_notification


def create_reaction(self: User, emoji: str, parent_post: Post) -> str:
    """
    Create a reaction for the user

    :param self: The acting user
    :param emoji: the emoji
    :param parent_post: the post that this reaction is attached to
    :return ID of the new reaction
    """
    if sees_post(self, parent_post, context_home_or_profile=False):
        if parent_post.reactions2.filter(author=self, emoji=emoji):
            raise UnauthorizedAccess()

        if emoji_lib.emoji_count(emoji) != 1:
            raise BadRequest()

        new_reaction = Reaction()
        new_reaction.eid = make_uuid()
        new_reaction.author = self.id
        new_reaction.emoji = emoji
        new_reaction.created_at = now_seconds()

        parent_post.reactions2.append(new_reaction)
        parent_post.save()

        create_notification(
            self,
            notifying_href=new_reaction.make_href(parent_post),
            notifying_summary=new_reaction.emoji,
            notifying_action=NotifyingAction.Reaction,
            notified_href=parent_post.make_href(),
            notified_summary=parent_post.content,
            owner=parent_post.author
        )

        return str(new_reaction.eid)
    else:
        raise UnauthorizedAccess()


def get_reaction(reaction_id: str, parent_post: Post) -> Optional[Reaction]:
    """
    Get a reaction

    :param reaction_id: ID of the reaction
    :param parent_post: The parent post
    :return: The reaction
    """
    rs = parent_post.reactions2.filter(eid=reaction_id)
    if len(rs) != 1:
        return None
    return rs[0]


def owns_reaction(self: User, reaction: Reaction) -> bool:
    """
    Whether the user owns a reaction

    :param self: The acting user
    :param reaction: the reaction
    :return: whether the user owns a reaction
    """
    return self.id == reaction.author.id


def delete_reaction(self: User, reaction: Reaction, parent_post: Post):
    """
    Delete a reaction

    :param self: The acting user
    :param reaction: the comment
    :param parent_post: reaction's parent post
    """
    if owns_reaction(self, reaction):
        if not parent_post.reactions2.filter(eid=reaction.eid):
            raise NotFound()
        parent_post.reactions2 = parent_post.reactions2.exclude(eid=reaction.eid)
        parent_post.save()
    else:
        raise UnauthorizedAccess()
