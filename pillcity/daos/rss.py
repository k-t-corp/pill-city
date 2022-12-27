import os
import datetime
from typing import Set
from dateutil import tz
from feedgen.feed import FeedGenerator
from pillcity.models import User, NotifyingAction
from .user import get_rss_notifications_url
from .notification import get_notifications
from .plaintext_notification import plaintext_notification, plaintext_summary


notifying_action_to_rss_code = {
    NotifyingAction.Comment: 'c',
    NotifyingAction.Mention: 'm',
    NotifyingAction.Reaction: 'r',
    NotifyingAction.Reshare: 's',
    NotifyingAction.Follow: 'f'
}
# guarantees values are unique
assert len(notifying_action_to_rss_code.values()) == len(notifying_action_to_rss_code.keys())

rss_code_to_notifying_action = {}
for a, rc in notifying_action_to_rss_code.items():
    rss_code_to_notifying_action[rc] = a

notifying_action_value_to_rss_code = {}
for a, rc in notifying_action_to_rss_code.items():
    notifying_action_value_to_rss_code[a.value] = rc


def get_rss_notifications_xml(self: User, types: Set[NotifyingAction], types_str: str) -> str:
    web_domain = os.environ['WEB_DOMAIN']
    protocol = 'https'
    if 'localhost:' in web_domain:
        protocol = 'http'

    user_id = self.user_id
    title_descriptions = 'notifications'
    if len(types) != len(notifying_action_to_rss_code):
        title_descriptions = ', '.join(map(lambda t: t.value + 's', types))

    fg = FeedGenerator()
    # todo: duplicate with the path in app.py
    fg.id(get_rss_notifications_url(self, types_str))
    fg.title(f"@{user_id}'s {title_descriptions} on {web_domain}")
    fg.author({'name': f"@{user_id}@{web_domain}"})
    fg.link(href=f'{protocol}://{web_domain}/notifications', rel='alternate')
    fg.language('en')
    fg_updated = None

    # add_entry seems to be reversed... how weird
    for notification in reversed(get_notifications(self, None, 50)):
        if notification.notifying_action in types and notification.notifier not in self.blocking:
            notification_dt = datetime.datetime.fromtimestamp(notification.created_at, tz=tz.tzutc())

            fe = fg.add_entry()
            # todo: this is not a valid url lol
            fe.id(f'{protocol}://{web_domain}/notification/{notification.eid}')
            fe.published(notification_dt)
            fe.updated(notification_dt)
            fe.title(plaintext_notification(notification))
            fe.link(href=f"{protocol}://{web_domain}{notification.notified_href}")
            fe.description(plaintext_summary(notification.notified_summary, 150))
            if not fg_updated or notification_dt > fg_updated:
                fg_updated = notification_dt

    fg.updated(fg_updated)
    return fg.atom_str(pretty=True)
