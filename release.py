import os
from pymongo.uri_parser import parse_uri
from mongoengine import connect
from mini_gplus.daos.notification import backfill_notifications_eid
from mini_gplus.daos.circle import backfill_circles_eid
from mini_gplus.models.post import backfill_posts_embed_reactions_and_comments

uri = os.environ['MONGODB_URI']
connect(
    host=uri,
    db=parse_uri(uri)['database']
)
backfill_notifications_eid()
backfill_circles_eid()
backfill_posts_embed_reactions_and_comments()
