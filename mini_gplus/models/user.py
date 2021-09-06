from typing import List
from mongoengine import Document, ListField, LazyReferenceField, StringField, BooleanField, PULL, NULLIFY
from .created_at_mixin import CreatedAtMixin
from .media import Media


class User(Document, CreatedAtMixin):
    user_id = StringField(required=True, unique=True)
    password = StringField(required=True)
    followings = ListField(LazyReferenceField('User', reverse_delete_rule=PULL), default=[])  # type: List[User]
    avatar = LazyReferenceField(Media, reverse_delete_rule=NULLIFY)
    profile_pic = StringField(required=False, default="pill1.png")
    admin = BooleanField(required=False, default=False)
