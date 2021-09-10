from bson import ObjectId
from typing import Dict, List, Union
from mini_gplus.models import User

UserCacheByUserId = {}  # type: Dict[str, str]
UserCacheByOid = {}  # type: Dict[ObjectId, str]


def set_in_user_cache(user: User):
    UserCacheByUserId[user.user_id] = user.to_json()
    UserCacheByOid[user.id] = user.to_json()


def get_in_user_cache_by_user_id(user_id: str) -> Union[User, bool]:
    if user_id in UserCacheByUserId:
        return User.from_json(UserCacheByUserId[user_id])
    return False


def get_in_user_cache_by_oid(oid: ObjectId) -> Union[User, bool]:
    if oid in UserCacheByOid:
        return User.from_json(UserCacheByOid[oid])
    return False


def populate_user_cache():
    for user in User.objects():
        set_in_user_cache(user)


def get_users_in_user_cache() -> List[User]:
    return list(map(User.from_json, UserCacheByOid.values()))


def reset_user_cache():
    """
    Only useful for testing
    """
    for user_id in UserCacheByUserId:
        UserCacheByUserId[user_id] = False
    for oid in UserCacheByOid:
        UserCacheByOid[oid] = False
