from mongoengine import Document, StringField, BooleanField


class InvitationCode(Document):
    code = StringField(required=True, unique=True)
    claimed = BooleanField(required=True)
