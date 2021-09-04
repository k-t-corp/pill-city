from mongoengine import NotUniqueError
from werkzeug.security import generate_password_hash, check_password_hash
from mini_gplus.models import User, Media
from .exceptions import UnauthorizedAccess
from .user_cache import set_in_user_cache, get_users_in_user_cache, get_in_user_cache_by_user_id

AvailableProfilePics = ["pill1.png", "pill2.png", "pill3.png", "pill4.png", "pill5.png", "pill6.png"]


def sign_up(user_id, password):
    """
    Signs up a user

    :param (str) user_id: user id
    :param (str) password: password
    :return (bool): Whether creation is successful.
        If False, id is already taken
    """
    new_user = User()
    new_user.user_id = user_id
    new_user.password = generate_password_hash(password)
    try:
        new_user.save()
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


def find_user(user_id):
    """
    Finds the user

    :param (str) user_id: user id
    :return (User|bool): Whether the user exists
    """
    return get_in_user_cache_by_user_id(user_id)


def get_users(user_id):
    """
    Get all other users besides the current user

    :param (str) user_id: user id of the current user
    :return (List[User]): All other users besides the current user
    """
    return list(filter(lambda u: u.user_id != user_id, get_users_in_user_cache()))


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


def update_avatar(self, avatar_media):
    """
    Update a user's avatar

    :param (User) self: The acting user
    :param (Media) avatar_media: The new avatar
    """
    self.avatar = avatar_media
    self.save()
    set_in_user_cache(self)
