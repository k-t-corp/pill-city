from mongoengine import Document, StringField, EmailField, LongField


class PasswordResetClaim(Document):
    code = StringField(required=True)
    email = EmailField(required=True, unique=True)
    expire_at = LongField(required=True)
