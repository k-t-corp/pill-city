from typing import List
from mongoengine import Document, ListField, ReferenceField, StringField, PULL, NULLIFY
from .created_at_mixin import CreatedAtMixin
from .media import Media


class User(Document, CreatedAtMixin):
    user_id = StringField(required=True, unique=True)
    password = StringField(required=True)
    followings = ListField(ReferenceField('User', reverse_delete_rule=PULL), default=[])  # type: List[User]
    avatar = ReferenceField(Media, reverse_delete_rule=NULLIFY)
    profile_pic = StringField(required=False, default="pill1.png")
