from typing import List
from mongoengine import Document, ListField, ReferenceField, LazyReferenceField, StringField, PULL, CASCADE
from .created_at_mixin import CreatedAtMixin
from .user import User


# todo: pending remove
class _Comment(Document, CreatedAtMixin):
    eid = StringField(required=True)
    author = LazyReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
    content = StringField(required=True)
    comments = ListField(ReferenceField('_Comment', reverse_delete_rule=PULL), default=[])  # type: List[_Comment]
    meta = {'collection': 'comment'}

    def make_href(self, parent_post):
        return f"/post/{parent_post.eid}#comment-{self.eid}"
