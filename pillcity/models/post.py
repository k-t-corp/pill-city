from typing import List
from mongoengine import Document, ListField, BooleanField, StringField, LazyReferenceField, EmbeddedDocumentListField, \
    EmbeddedDocument, LongField, PULL, CASCADE, NULLIFY, IntField, EmbeddedDocumentField
from .created_at_mixin import CreatedAtMixin
from .user import User
from .circle import Circle
from .media import Media


class Reaction(EmbeddedDocument):
    eid = StringField(required=True)
    author = LazyReferenceField(User, required=True)  # type: User
    emoji = StringField(required=True)
    # default=0 as a backfill because we've lost the timestamp if we haven't recorded it :(
    created_at = LongField(required=True, default=0)

    def make_href(self, parent_post):
        return f"/post/{parent_post.eid}#reaction-{self.eid}"


class Comment(EmbeddedDocument):
    eid = StringField(required=True)
    author = LazyReferenceField(User, required=True)  # type: User
    content = StringField(required=False, default='')
    comments = EmbeddedDocumentListField('Comment')  # type: List[Comment]
    # default=0 as a backfill because we've lost the timestamp if we haven't recorded it :(
    created_at = LongField(required=True, default=0)
    # no reverse delete rule but that's fine because when the comment is "deleted", media_list is manually reset
    media_list = ListField(LazyReferenceField(Media), default=[])  # type: List[Media]
    deleted = BooleanField(required=False, default=False)
    reply_to_comment_id = StringField(required=False, default='')

    def make_href(self, parent_post):
        return f"/post/{parent_post.eid}#comment-{self.eid}"


class PollChoice(EmbeddedDocument):
    eid = StringField(required=True)
    content = StringField(required=True)
    media = LazyReferenceField(Media)  # type: Media
    voters = ListField(LazyReferenceField(User), default=[])  # type: List[User]


class Poll(EmbeddedDocument):
    choices = EmbeddedDocumentListField(PollChoice)  # type: List[PollChoice]
    close_by = IntField(required=False)


class Post(Document, CreatedAtMixin):
    eid = StringField(required=True)
    author = LazyReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
    content = StringField(required=False, default='')
    is_public = BooleanField(required=True)

    reactions2 = EmbeddedDocumentListField(Reaction)
    comments2 = EmbeddedDocumentListField(Comment)
    poll = EmbeddedDocumentField(Poll)  # type: Poll

    circles = ListField(LazyReferenceField(Circle, reverse_delete_rule=PULL), default=[])  # type: List[Circle]
    reshareable = BooleanField(required=False, default=False)
    reshared_from = LazyReferenceField('Post', required=False, reverse_delete_rule=NULLIFY, default=None)  # type: Post
    media_list = ListField(LazyReferenceField(Media, reverse_delete_rule=PULL), default=[])  # type: List[Media]

    deleted = BooleanField(required=False, default=False)
    is_update_avatar = BooleanField(required=False, default=False)

    def make_href(self):
        return f"/post/{self.eid}"
