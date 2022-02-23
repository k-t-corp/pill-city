from mongoengine import Document, StringField, LazyReferenceField, IntField, DO_NOTHING
from .created_at_mixin import CreatedAtMixin


class Media(Document, CreatedAtMixin):
    # this is the object name (obviously..)
    id = StringField(primary_key=True)
    # todo: change to required
    # DO_NOTHING instead of NULLIFY here because of circular ref to User model
    #   We should instead manually NULLIFY.
    # Missing type because don't want circular ref
    owner = LazyReferenceField('User', required=False, default=None, reverse_delete_rule=DO_NOTHING)
    # todo: change to required
    refs = IntField(required=False, default=-1)
