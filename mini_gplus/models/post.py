from typing import List
from mongoengine import Document, ListField, BooleanField, ReferenceField, StringField, LazyReferenceField, PULL, \
    CASCADE, NULLIFY
from .created_at_mixin import CreatedAtMixin
from .user import User
from .comment import Comment
from .reaction import Reaction
from .circle import Circle
from .media import Media


class Post(Document, CreatedAtMixin):
    eid = StringField(required=True)
    author = LazyReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
    content = StringField(required=True)
    is_public = BooleanField(required=True)
    reactions = ListField(ReferenceField(Reaction, reverse_delete_rule=PULL), default=[])  # type: List[Reaction]
    circles = ListField(ReferenceField(Circle, reverse_delete_rule=PULL), default=[])  # type: List[Circle]
    comments = ListField(ReferenceField(Comment, reverse_delete_rule=PULL), default=[])  # type: List[Comment]
    reshareable = BooleanField(required=False, default=False)
    reshared_from = ReferenceField('Post', required=False, reverse_delete_rule=NULLIFY, default=None)  # type: Post
    media_list = ListField(LazyReferenceField(Media, reverse_delete_rule=PULL), default=[])  # type: List[Media]

    def make_href(self):
        return f"/post/{self.eid}"
