import os
from pymongo.uri_parser import parse_uri
from mongoengine import connect
from mini_gplus.daos.post import backfill_post_created_at_ms
from mini_gplus.daos.notification import backfill_notifications_created_at_ms, backfill_notifications_eid

uri = os.environ['MONGODB_URI']
connect(
    host=uri,
    db=parse_uri(uri)['database']
)
backfill_post_created_at_ms()
backfill_notifications_created_at_ms()
backfill_notifications_eid()
