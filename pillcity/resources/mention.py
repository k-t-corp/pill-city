from typing import List
from pillcity.daos.user import find_user
from pillcity.models import User
from pillcity.daos.content import format_content

def get_mentioned_user_ids(content: str) -> List[User]:
    fc = format_content(content)
    mentioned_users = []
    for s in fc.segments:
        if 'mention' in s.types and s.reference < len(fc.references):
            mentioned_user_id = fc.references[s.reference]
            user = find_user(mentioned_user_id)
            if user:
                mentioned_users.append(user)
    return mentioned_users
