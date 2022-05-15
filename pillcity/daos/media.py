from typing import List, Optional
from pillcity.models import Media, User
from pillcity.utils.now_ms import now_seconds
from .s3 import upload_to_s3, delete_from_s3


def get_media(object_name: str) -> Media:
    return Media.objects.get(id=object_name)


def get_media_page(owner: User, page_number: int, page_count: int) -> List[Media]:
    """
    Get a page of media items owned by a user, reverse chronologically ordered
    """
    return list(
        Media.objects(owner=owner).order_by('-created_at', '+id').skip(page_number * page_count).limit(page_count)
    )


def create_media(file, object_name_stem: str, owner: User) -> Optional[Media]:
    object_name = upload_to_s3(file, object_name_stem)
    if not object_name:
        return None

    media = Media()
    media.id = object_name
    media.owner = owner
    media.refs = 0

    now = now_seconds()
    media.created_at = now
    media.used_at = now

    # have to force save for some reason...
    # https://github.com/MongoEngine/mongoengine/issues/1246
    media.save(force_insert=True)

    return media


def use_media(media: Media):
    media.refs += 1
    media.used_at = now_seconds()
    media.save()


def use_media_list(media_list: List[Media]):
    for media in media_list:
        use_media(media)


def delete_media(media: Media):
    # we can always fetch because all reference to Media is Lazy...
    media = media.fetch()
    media.refs -= 1
    if media.refs <= 0:
        object_name = media.id
        media.delete()
        delete_from_s3(object_name)
    else:
        media.save()


def delete_media_list(media_list: List[Media]):
    for media in media_list:
        delete_media(media)
