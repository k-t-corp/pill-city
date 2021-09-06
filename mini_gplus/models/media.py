from mongoengine import Document, StringField
from .created_at_mixin import CreatedAtMixin


class Media(Document, CreatedAtMixin):
    # this is the object name (obviously..)
    id = StringField(primary_key=True)
