from enum import Enum
from mongoengine import Document, LazyReferenceField, StringField, EnumField, BooleanField, CASCADE
from .created_at_mixin import CreatedAtMixin
from .user import User


class NotifyingAction(Enum):
    Comment = "comment"
    Mention = "mention"
    Reaction = "reaction"
    Reshare = "reshare"


class Notification(Document, CreatedAtMixin):
    eid = StringField(required=False)  # backfilled by backfill_notifications_eid
    notifier = LazyReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
    notifying_href = StringField(required=True)
    notifying_action = EnumField(NotifyingAction, required=True)  # type: NotifyingAction
    notified_href = StringField(required=True)
    owner = LazyReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
    unread = BooleanField(required=False, default=True)
