from typing import List
from pillcity.daos.user import find_user
from pillcity.models import User


def check_mentioned_user_ids(mentioned_user_ids: List[str]) -> List[User]:
    mentioned_users = []
    for mentioned_user_id in mentioned_user_ids:
        user = find_user(mentioned_user_id)
        if user:
            mentioned_users.append(user)
    return mentioned_users
