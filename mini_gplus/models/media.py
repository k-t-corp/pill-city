from mongoengine import Document, StringField
from .created_at_mixin import CreatedAtMixin


class Media(Document, CreatedAtMixin):
    object_name = StringField(required=True, unique=True)
