from bson import ObjectId
from typing import Dict
from mini_gplus.models import User

UserCacheByUserId = {}  # type: Dict[str, User]
UserCacheByOid = {}  # type: Dict[ObjectId, User]


def set_in_user_cache(user: User):
    UserCacheByUserId[user.user_id] = user
    UserCacheByOid[user.id] = user


def get_in_user_cache_by_user_id(user_id: str):
    if user_id in UserCacheByUserId:
        return UserCacheByUserId[user_id]
    return False


def get_in_user_cache_by_oid(oid: ObjectId):
    if oid in UserCacheByOid:
        return UserCacheByOid[oid]
    return False


def populate_user_cache():
    for user in User.objects():
        set_in_user_cache(user)


def get_users_in_user_cache():
    return UserCacheByOid.values()


def reset_user_cache():
    """
    Only useful for testing
    """
    for user_id in UserCacheByUserId:
        UserCacheByUserId[user_id] = False
    for oid in UserCacheByOid:
        UserCacheByOid[oid] = False
