from typing import List
from mongoengine import Document, ListField, BooleanField, ReferenceField, StringField, LazyReferenceField, \
    EmbeddedDocumentListField, EmbeddedDocument, PULL, CASCADE, NULLIFY
from .created_at_mixin import CreatedAtMixin
from .user import User
from ._comment import _Comment
from ._reaction import _Reaction
from .circle import Circle
from .media import Media


class Reaction(EmbeddedDocument, CreatedAtMixin):
    eid = StringField(required=True)
    author = LazyReferenceField(User, required=True)  # type: User
    emoji = StringField(required=True)

    def make_href(self, parent_post):
        return f"/post/{parent_post.eid}#reaction-{self.eid}"


class Comment(EmbeddedDocument, CreatedAtMixin):
    eid = StringField(required=True)
    author = LazyReferenceField(User, required=True)  # type: User
    content = StringField(required=True)
    comments = EmbeddedDocumentListField('Comment')  # type: List[Comment]

    def make_href(self, parent_post):
        return f"/post/{parent_post.eid}#comment-{self.eid}"


class Post(Document, CreatedAtMixin):
    eid = StringField(required=True)
    author = LazyReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
    content = StringField(required=True)
    is_public = BooleanField(required=True)

    reactions2 = EmbeddedDocumentListField(Reaction)
    comments2 = EmbeddedDocumentListField(Comment)

    circles = ListField(ReferenceField(Circle, reverse_delete_rule=PULL), default=[])  # type: List[Circle]
    reshareable = BooleanField(required=False, default=False)
    reshared_from = ReferenceField('Post', required=False, reverse_delete_rule=NULLIFY, default=None)  # type: Post
    media_list = ListField(LazyReferenceField(Media, reverse_delete_rule=PULL), default=[])  # type: List[Media]

    def make_href(self):
        return f"/post/{self.eid}"
