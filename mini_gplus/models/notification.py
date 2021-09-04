from enum import Enum
from mongoengine import Document, ReferenceField, StringField, CASCADE,  EnumField
from .created_at_mixin import CreatedAtMixin
from .user import User


class NotifyingAction(Enum):
    Comment = "comment"
    Mention = "mention"
    Reaction = "reaction"
    Reshare = "reshare"


class Notification(Document, CreatedAtMixin):
    notifier = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
    notifying_href = StringField(required=True)
    notifying_action = EnumField(NotifyingAction, required=True)  # type: NotifyingAction
    notified_href = StringField(required=True)
    owner = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
