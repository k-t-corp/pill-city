from mongoengine import NotUniqueError
from werkzeug.security import generate_password_hash, check_password_hash
from mini_gplus.models import User, Media
from .exceptions import UnauthorizedAccess

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
    users = []
    for user in User.objects(user_id=user_id):
        if check_password_hash(user.password, password):
            users.append(user)
    if not users:
        return False
    elif len(users) == 1:
        return users[0]
    else:
        raise RuntimeError('More than one user for user id {} found!'.format(user_id))


def find_user(user_id):
    """
    Finds the user

    :param (str) user_id: user id
    :return (User|bool): Whether the user exists
    """
    users = User.objects(user_id=user_id)
    if not users:
        return False
    elif len(users) == 1:
        return users[0]
    else:
        raise RuntimeError('More than one user for user id {} found!'.format(user_id))


def get_users(user_id):
    return list(User.objects(user_id__ne=user_id))


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
    return True


def get_followings(self):
    """
    Get all followings
    :return (List[User]): List of following users.
    """
    return list(self.followings)


def update_profile_pic(self, profile_pic):
    """
    Update a user's profile picture

    :param (User) self: The acting user
    :param (str) profile_pic: The picked profile picture
    """
    if profile_pic in AvailableProfilePics:
        self.profile_pic = profile_pic
        self.save()
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
