import os
import datetime
from dateutil import tz
from feedgen.feed import FeedGenerator
from mini_gplus.models import User
from .user import get_rss_notifications_url
from .notification import get_notifications
from .plaintext_notification import plaintext_notification, plaintext_summary


def get_rss_notifications_xml(self: User) -> str:
    domain = os.environ['DOMAIN']
    protocol = 'https'
    if 'localhost:' in domain:
        protocol = 'http'

    user_id = self.user_id

    fg = FeedGenerator()
    # todo: duplicate with the path in app.py
    fg.id(get_rss_notifications_url(self))
    fg.title(f"@{user_id}'s notifications on {domain}")
    fg.author({'name': f"@{user_id}@{domain}"})
    fg.link(href=f'{protocol}://{domain}/notifications', rel='alternate')
    fg.language('en')
    fg_updated = None

    # add_entry seems to be reversed... how weird
    for i, notification in enumerate(reversed(get_notifications(self, None))):
        notification_dt = datetime.datetime.fromtimestamp(notification.created_at, tz=tz.tzutc())

        fe = fg.add_entry()
        # todo: this is not a valid url lol
        fe.id(f'{protocol}://{domain}/notification/{notification.eid}')
        fe.published(notification_dt)
        fe.updated(notification_dt)
        fe.title(plaintext_notification(notification))
        fe.link(href=f"{protocol}://{domain}{notification.notified_href}")
        fe.description(plaintext_summary(notification.notified_summary, 150))
        if not fg_updated or notification_dt > fg_updated:
            fg_updated = notification_dt

    fg.updated(fg_updated)
    return fg.atom_str(pretty=True)
