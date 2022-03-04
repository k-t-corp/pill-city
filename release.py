import os
from pymongo.uri_parser import parse_uri
from mongoengine import connect
from pillcity.models import User, Post, Media

uri = os.environ['MONGODB_URI']
connect(
    host=uri,
    db=parse_uri(uri)['database']
)

print("Running release")
