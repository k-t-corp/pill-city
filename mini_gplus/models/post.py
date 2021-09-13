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

    # todo: pending remove
    reactions = ListField(ReferenceField(_Reaction, reverse_delete_rule=PULL), default=[])  # type: List[_Reaction]
    # todo: pending remove
    comments = ListField(ReferenceField(_Comment, reverse_delete_rule=PULL), default=[])  # type: List[_Comment]

    circles = ListField(ReferenceField(Circle, reverse_delete_rule=PULL), default=[])  # type: List[Circle]
    reshareable = BooleanField(required=False, default=False)
    reshared_from = ReferenceField('Post', required=False, reverse_delete_rule=NULLIFY, default=None)  # type: Post
    media_list = ListField(LazyReferenceField(Media, reverse_delete_rule=PULL), default=[])  # type: List[Media]

    def make_href(self):
        return f"/post/{self.eid}"


def backfill_posts_embed_reactions_and_comments():
    backfill_count = 0
    for post in Post.objects():
        backfilled = False
        if post.reactions:
            for reaction in post.reactions:  # type: _Reaction
                reaction2 = Reaction()
                reaction2.eid = reaction.eid
                reaction2.author = reaction.author
                reaction2.emoji = reaction.emoji
                post.reactions2.append(reaction2)
            post.reactions = []
            post.save()
            backfilled = True
        if post.comments:
            for comment in post.comments:  # type: _Comment
                comment2 = Comment()
                comment2.eid = comment.eid
                comment2.author = comment.author
                comment2.content = comment.content
                for nested_comment in comment.comments:
                    nested_comment2 = Comment()
                    nested_comment2.eid = nested_comment.eid
                    nested_comment2.author = nested_comment.author
                    nested_comment2.content = nested_comment.content
                    comment2.comments.append(nested_comment2)
                post.comments2.append(comment2)
            post.comments = []
            post.save()
            backfilled = True
        if backfilled:
            backfill_count += 1
    if backfill_count != 0:
        print(f'Backfilled {backfill_count} Post with embedded comments and reactions')
    else:
        print("No Post was backfilled with embedded comments and reactions. You can remove backfill code,"
              " legacy fields and legacy models now!")
