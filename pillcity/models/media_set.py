from typing import List
from mongoengine import Document, LazyReferenceField, ListField, StringField, BooleanField
from .user import User
from .media import Media
from .created_at_mixin import CreatedAtMixin


class MediaSet(Document, CreatedAtMixin):
    eid = StringField(required=True)
    owner = LazyReferenceField(User, required=True)  # type: User
    name = StringField(required=True)
    media_list = ListField(LazyReferenceField(Media), default=[])  # type: List[Media]
    is_public = BooleanField(required=False, default=False)
    meta = {
        'indexes': [
            {'fields': ('owner', 'name'), 'unique': True}
        ]
    }
