import os
from pymongo.uri_parser import parse_uri
from mongoengine import connect
from mini_gplus.daos.notification import backfill_notifications_eid

uri = os.environ['MONGODB_URI']
connect(
    host=uri,
    db=parse_uri(uri)['database']
)
backfill_notifications_eid()
