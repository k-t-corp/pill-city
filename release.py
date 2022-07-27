import os
import logging
from pymongo.uri_parser import parse_uri
from mongoengine import connect

logging.basicConfig(level=logging.INFO)

uri = os.environ['MONGODB_URI']
connect(
    host=uri,
    db=parse_uri(uri)['database']
)

logging.info("Running release")
