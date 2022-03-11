from mongoengine import Document, StringField, LazyReferenceField, IntField, LongField, DO_NOTHING


class Media(Document):
    # this is the object name (obviously..)
    id = StringField(primary_key=True)
    # todo: change to required
    # DO_NOTHING instead of NULLIFY here because of circular ref to User model
    #   We should instead manually NULLIFY.
    #   See https://github.com/MongoEngine/mongoengine/issues/1697
    # Missing type because don't want circular ref
    owner = LazyReferenceField('User', required=False, default=None, reverse_delete_rule=DO_NOTHING)
    # todo: change to required
    refs = IntField(required=False, default=-1)
    # todo: change to required
    created_at = LongField(required=False, default=0)
    # todo: change to required
    used_at = LongField(required=False, default=0)
