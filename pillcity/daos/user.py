import os
from typing import Union, Optional, List
from mongoengine import NotUniqueError
from werkzeug.security import generate_password_hash, check_password_hash
from pillcity.models import User, Media
from pillcity.utils.profiling import timer
from pillcity.utils.make_uuid import make_dashless_uuid
from pillcity.models import NotifyingAction
from .exceptions import UnauthorizedAccess
from .user_cache import set_in_user_cache, get_users_in_user_cache, get_in_user_cache_by_user_id
from .notification import create_notification
from .media import use_media

AvailableProfilePics = ["pill1.png", "pill2.png", "pill3.png", "pill4.png", "pill5.png", "pill6.png"]


def sign_up(
    user_id: str,
    password: str,
    display_name: Optional[str] = None,
    email: Optional[str] = None
) -> bool:
    """
    Signs up a user

    :param user_id: Unique user ID
    :param password: Password
    :param display_name: Display name
    :param email: Email
    :return: Whether creation is successful. If False, id is already taken
    """
    new_user = User()
    new_user.user_id = user_id
    new_user.password = generate_password_hash(password)
    if display_name:
        new_user.display_name = display_name
    if email:
        new_user.email = email
    try:
        new_user.save()
        if os.getenv('OFFICIAL', None):
            official_user_id = os.getenv('OFFICIAL')
            official_user = find_user(official_user_id)
            if official_user:
                add_following(new_user, official_user)
        set_in_user_cache(new_user)
    except NotUniqueError:
        return False
    return True


def sign_in(user_id, password):
    """
    Attempts to sign in a user

    :param (str) user_id: user id
    :param (str) password: password
    :return (User|bool): Whether the user exists
    :exception (RuntimeError): If more than one user for the user id is found
    """
    user = get_in_user_cache_by_user_id(user_id)
    if not user:
        return False
    if not check_password_hash(user.password, password):
        return False
    return user


@timer
def find_user(user_id: str) -> Union[User, bool]:
    """
    Finds the user

    :param user_id: user id
    :return: Whether the user exists
    """
    return get_in_user_cache_by_user_id(user_id)


def get_users(user_id):
    """
    Get all other users besides the current user

    :param (str) user_id: user id of the current user
    :return (List[User]): All other users besides the current user
    """
    return list(filter(lambda u: u.user_id != user_id, get_users_in_user_cache()))


def search_users(keyword: str) -> List[User]:
    """
    Search for users by a keyword.

    :param keyword: The keyword
    :return: List of matching users
    """
    if not keyword:
        return []
    keyword = keyword.lower()
    matched_users = []
    for user in get_users_in_user_cache():
        if keyword in user.user_id.lower() or (user.display_name and keyword in user.display_name.lower()):
            matched_users.append(user)
    return matched_users


def add_following(self, user):
    """
    Add a following

    :param (User) self: The acting user
    :param (User) user: the added user
    :return (bool): Whether adding is successful.
    """
    if user in self.followings:
        return False
    self.followings.append(user)
    self.save()
    set_in_user_cache(self)
    create_notification(
        self=self,
        notifying_href='',
        notifying_summary='',
        notifying_action=NotifyingAction.Follow,
        notified_href='',
        notified_summary='',
        owner=user
    )
    return True


def remove_following(self, user):
    """
    Remove a following

    :param (User) self: The acting user
    :param (User) user: the removed user
    :return (bool): Whether removing is successful.
    """
    if user not in self.followings:
        return False
    self.followings = list(filter(lambda u: u.id != user.id, self.followings))
    self.save()
    set_in_user_cache(self)
    return True


def is_following(self, user_id):
    """
    Whether a user is following another user

    :param (User) self: The acting user
    :param (str) user_id: The another user id that needs to tell whether following or not
    :return (bool): Whether a user is following another user
    """
    user = find_user(user_id)
    return user.id in map(lambda u: u.id, self.followings)


def update_profile_pic(self, profile_pic):
    """
    Update a user's profile picture

    :param (User) self: The acting user
    :param (str) profile_pic: The picked profile picture
    """
    if profile_pic in AvailableProfilePics:
        self.profile_pic = profile_pic
        self.save()
        set_in_user_cache(self)
    else:
        raise UnauthorizedAccess()


def update_avatar(self: User, avatar_media: Media):
    """
    Update a user's avatar

    :param self: The acting user
    :param avatar_media: The new avatar
    """
    use_media(avatar_media)
    self.avatar = avatar_media
    self.save()
    set_in_user_cache(self)


def update_display_name(self: User, display_name: str):
    """
    Update a user's display name

    :param self: The acting user
    :param display_name: New display name
    """
    self.display_name = display_name
    self.save()
    set_in_user_cache(self)


def check_email(email: str) -> bool:
    """
    Check whether an email address is available

    :param email: Checked email
    :return: Whether an email address is available
    """
    users = get_users_in_user_cache()
    for user in users:
        if user.email == email:
            return False
    return True


def update_email(self: User, email: str) -> bool:
    """
    Update a user's email

    :param self: The acting user
    :param email: New email
    :return Whether this email is already taken
    """
    if not check_email(email):
        return False
    self.email = email
    self.save()
    set_in_user_cache(self)
    return True


def get_email(self: User) -> Optional[str]:
    """
    Get a user's email

    :param self: The acting user
    """
    user = get_in_user_cache_by_user_id(self.user_id)
    if not user:
        return
    return user.email


def get_rss_token(self: User) -> Optional[str]:
    """
    Get a user's RSS token

    :param self: The acting user
    :return: The user's RSS token
    """
    user = get_in_user_cache_by_user_id(self.user_id)
    if not user:
        return
    return user.rss_token


def get_rss_notifications_url(self: User, types: str = '') -> str:
    api_domain = os.environ['API_DOMAIN']
    protocol = 'https'
    # todo: lol so hack
    if 'localhost:' in api_domain:
        protocol = 'http'
    # todo: this is duplicate with the actual path in app.py
    base_url = f'{protocol}://{api_domain}/rss/{self.user_id}/notifications?token={self.rss_token}'
    if not types:
        return base_url
    return base_url + f'&types={types}'


def rotate_rss_token(self: User) -> str:
    """
    Rotate a user's RSS token

    :param self: The acting user
    :return: The new RSS token
    """
    new_token = make_dashless_uuid()
    if get_user_by_rss_token(new_token):
        raise Exception('Duplicate RSS token. Please retry.')

    self.rss_token = new_token
    self.save()
    set_in_user_cache(self)
    return new_token


def delete_rss_token(self: User):
    """
    Rotate a user's RSS token

    :param self: The acting user
    """
    self.rss_token = None
    self.save()
    set_in_user_cache(self)


def get_user_by_rss_token(token: str) -> Optional[User]:
    """
    Get a user by RSS token

    :param token: The queried RSS token
    :return: The user found
    """
    for user in get_users_in_user_cache():
        if user.rss_token == token:
            return user
    return None


def find_ghost_user_or_raise() -> User:
    ghost_user_id = os.environ['GHOST']
    ghost_user = find_user(ghost_user_id)
    if not ghost_user:
        raise RuntimeError(f'Ghost user {ghost_user_id} does not exist')
    return ghost_user
