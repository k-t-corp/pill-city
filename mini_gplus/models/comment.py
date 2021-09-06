from typing import List
from mongoengine import Document, ListField, ReferenceField, StringField, PULL, CASCADE
from .created_at_mixin import CreatedAtMixin
from .user import User


class Comment(Document, CreatedAtMixin):
    eid = StringField(required=True)
    author = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
    content = StringField(required=True)
    comments = ListField(ReferenceField('Comment', reverse_delete_rule=PULL), default=[])  # type: List[Comment]

    def make_href(self, parent_post):
        return f"/post/{parent_post.eid}#comment-{self.eid}"
