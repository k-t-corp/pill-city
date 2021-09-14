from mongoengine import Document, LazyReferenceField, StringField, CASCADE
from .created_at_mixin import CreatedAtMixin
from .user import User


# todo: pending remove
class _Reaction(Document, CreatedAtMixin):
    eid = StringField(required=True)
    author = LazyReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
    emoji = StringField(required=True)
    meta = {'collection': 'reaction'}

    def make_href(self, parent_post):
        return f"/post/{parent_post.eid}#reaction-{self.eid}"
