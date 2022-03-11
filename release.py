import os
from pymongo.uri_parser import parse_uri
from mongoengine import connect

uri = os.environ['MONGODB_URI']
connect(
    host=uri,
    db=parse_uri(uri)['database']
)

print("Running release")
