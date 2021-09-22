import os
from pymongo.uri_parser import parse_uri
from mongoengine import connect
from mini_gplus.daos._backfill_notification_href_summaries import backfill_notification_href_summaries

uri = os.environ['MONGODB_URI']
connect(
    host=uri,
    db=parse_uri(uri)['database']
)

# backfill_notification_href_summaries()
