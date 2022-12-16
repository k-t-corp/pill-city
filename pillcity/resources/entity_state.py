from enum import Enum
from flask_restful import fields
from flask_jwt_extended import get_jwt_identity
from pillcity.daos.user_cache import get_in_user_cache_by_user_id

class EntityStates(Enum):
    Visible = 'visible'
    Invisible = 'invisible'
    AuthorBlocked = "author_blocked"
    Deleted = 'deleted'


class EntityState(fields.Raw):
    def output(self, key, entity):
        author = entity.author
        user_id = get_jwt_identity()
        user = get_in_user_cache_by_user_id(user_id)
        author_blocked = user and author and author in user.blocking
        deleted = entity.deleted
        if not author_blocked and not deleted:
            return EntityStates.Visible.value
        if (hasattr(entity, 'reactions2') and not entity.reactions2) \
                and (hasattr(entity, 'comments2') and not entity.comments2) \
                and (hasattr(entity, 'poll') and not entity.poll):
            return EntityStates.Invisible.value
        if author_blocked:
            return EntityStates.AuthorBlocked.value
        return EntityStates.Deleted.value
