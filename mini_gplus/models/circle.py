from typing import List
from mongoengine import Document, ListField, ReferenceField, StringField, PULL, CASCADE
from .created_at_mixin import CreatedAtMixin
from .user import User


class Circle(Document, CreatedAtMixin):
    owner = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
    name = StringField(required=True)
    members = ListField(ReferenceField(User, reverse_delete_rule=PULL), default=[])  # type: List[User]
    meta = {
        'indexes': [
            {'fields': ('owner', 'name'), 'unique': True}
        ]
    }
