from typing import List
from mongoengine import Document, ListField, BooleanField, StringField, LazyReferenceField, EmbeddedDocumentListField, \
    EmbeddedDocument, LongField, PULL, CASCADE, NULLIFY
from .created_at_mixin import CreatedAtMixin
from .user import User
from .circle import Circle
from .media import Media


class Reaction(EmbeddedDocument):
    eid = StringField(required=True)
    author = LazyReferenceField(User, required=True)  # type: User
    emoji = StringField(required=True)
    created_at = LongField(required=True, default=0)
    # default=0 as a backfill because we've lost the timestamp if we haven't recorded it :(

    def make_href(self, parent_post):
        return f"/post/{parent_post.eid}#reaction-{self.eid}"


class Comment(EmbeddedDocument):
    eid = StringField(required=True)
    author = LazyReferenceField(User, required=True)  # type: User
    content = StringField(required=True)
    comments = EmbeddedDocumentListField('Comment')  # type: List[Comment]
    created_at = LongField(required=True, default=0)
    # default=0 as a backfill because we've lost the timestamp if we haven't recorded it :(
    deleted = BooleanField(required=False, default=False)

    def make_href(self, parent_post):
        return f"/post/{parent_post.eid}#comment-{self.eid}"


class Post(Document, CreatedAtMixin):
    eid = StringField(required=True)
    author = LazyReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
    content = StringField(required=False, default='')
    is_public = BooleanField(required=True)

    reactions2 = EmbeddedDocumentListField(Reaction)
    comments2 = EmbeddedDocumentListField(Comment)

    circles = ListField(LazyReferenceField(Circle, reverse_delete_rule=PULL), default=[])  # type: List[Circle]
    reshareable = BooleanField(required=False, default=False)
    reshared_from = LazyReferenceField('Post', required=False, reverse_delete_rule=NULLIFY, default=None)  # type: Post
    media_list = ListField(LazyReferenceField(Media, reverse_delete_rule=PULL), default=[])  # type: List[Media]

    deleted = BooleanField(required=False, default=False)

    def make_href(self):
        return f"/post/{self.eid}"
