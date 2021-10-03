from enum import Enum
from mongoengine import Document, StringField, EnumField, URLField


class LinkPreviewState(Enum):
    Fetching = "fetching"
    Fetched = "fetched"
    Errored = "errored"


class LinkPreview(Document):
    url = URLField(required=True)
    title = StringField(required=False, default='')
    subtitle = StringField(required=False, default='')
    image_url = URLField(required=False)
    youtube_vid = StringField(required=False)
    state = EnumField(LinkPreviewState, required=True)
