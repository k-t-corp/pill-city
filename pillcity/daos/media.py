from typing import List
from pillcity.models import Media, User


def get_media(object_name: str):
    return Media.objects.get(id=object_name)


def create_media(object_name: str, owner: User):
    media = Media()
    media.id = object_name
    media.owner = owner
    media.refs = 0
    # have to force save for some reason...
    # https://github.com/MongoEngine/mongoengine/issues/1246
    media.save(force_insert=True)

    return media


def use_media(media: Media):
    media.refs += 1
    media.save()


def use_media_list(media_list: List[Media]):
    for media in media_list:
        use_media(media)
