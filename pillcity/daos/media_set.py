from typing import List
from mongoengine import NotUniqueError
from pillcity.models import User, Media
from pillcity.models.media_set import MediaSet
from pillcity.utils.make_uuid import make_uuid
from .exceptions import UnauthorizedAccess, Conflict, NotFound


def create_media_set(self: User, name: str) -> str:
    new_ms = MediaSet()
    new_ms.eid = make_uuid()
    new_ms.owner = self
    new_ms.name = name
    try:
        new_ms.save()
    except NotUniqueError:
        raise Conflict()
    return new_ms.eid


def find_media_set(self: User, media_set_id: str) -> MediaSet:
    ms = MediaSet.objects(owner=self, eid=media_set_id)
    if not ms or len(ms) > 1:
        raise NotFound()
    return ms[0]


def rename_media_set(self: User, media_set: MediaSet, new_name: str):
    if self != media_set.owner:
        raise UnauthorizedAccess()
    media_set.name = new_name
    media_set.save()


def delete_media_set(self: User, media_set: MediaSet):
    if self != media_set.owner:
        raise UnauthorizedAccess()
    media_set.delete()


def toggle_media(self: User, media_set: MediaSet, toggled_media: Media):
    if self != media_set.owner or self != toggled_media.owner:
        raise UnauthorizedAccess()
    if toggled_media in media_set.media_list:
        media_set.media_list.remove(toggled_media)
    else:
        media_set.media_list.append(toggled_media)
    media_set.save()


def make_media_set_public(self: User, media_set: MediaSet):
    if self != media_set.owner:
        raise UnauthorizedAccess()
    media_set.is_public = True
    media_set.save()


def add_media_to_media_set(self: User, media_set: MediaSet, media: Media):
    if self != media_set.owner:
        raise UnauthorizedAccess()
    if self != media.owner:
        raise UnauthorizedAccess()
    if media in media_set.media_list:
        raise Conflict()
    media_set.media_list.append(media)
    media_set.save()


def remove_media_from_media_set(self: User, media_set: MediaSet, media: Media):
    if self != media_set.owner:
        raise UnauthorizedAccess()
    if self != media.owner:
        raise UnauthorizedAccess()
    if media not in media_set.media_list:
        raise Conflict()
    media_set.media_list.remove(media)
    media_set.save()


def get_media_sets(self: User) -> List[MediaSet]:
    return list(reversed(sorted(MediaSet.objects(owner=self), key=lambda ms: ms.created_at)))


def get_all_public_media_sets(self: User) -> List[MediaSet]:
    return list(reversed(sorted(MediaSet.objects(is_public=True, owner__ne=self), key=lambda ms: ms.created_at)))
