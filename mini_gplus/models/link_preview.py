from enum import Enum
from mongoengine import Document, StringField, EnumField, URLField, ListField


class LinkPreviewState(Enum):
    Fetching = "fetching"
    Fetched = "fetched"
    Errored = "errored"


class LinkPreview(Document):
    url = URLField(required=True)
    title = StringField(required=False, default='')
    subtitle = StringField(required=False, default='')
    image_urls = ListField(URLField, required=False, default=[])
    youtube_vid = StringField(required=False)
    twitter_tid = StringField(required=False)
    state = EnumField(LinkPreviewState, required=True)
