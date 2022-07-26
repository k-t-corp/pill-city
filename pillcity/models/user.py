from typing import List
from mongoengine import Document, ListField, LazyReferenceField, StringField, PULL, NULLIFY, EmailField
from .created_at_mixin import CreatedAtMixin
from .media import Media


class User(Document, CreatedAtMixin):
    user_id = StringField(required=True, unique=True)
    password = StringField(required=True)
    followings = ListField(LazyReferenceField('User', reverse_delete_rule=PULL), default=[])  # type: List[User]
    blocking = ListField(LazyReferenceField('User', reverse_delete_rule=PULL), default=[])  # type: List[User]
    avatar = LazyReferenceField(Media, reverse_delete_rule=NULLIFY)  # type: Media
    profile_pic = StringField(required=False, default="pill1.png")
    display_name = StringField(required=False)
    email = EmailField(required=False)
    rss_token = StringField(required=False)
