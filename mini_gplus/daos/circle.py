from mongoengine import NotUniqueError
from mini_gplus.models import Circle
from mini_gplus.utils.make_uuid import make_uuid
from mini_gplus.utils.profiling import timer
from .user import User
from .exceptions import UnauthorizedAccess


def get_circles(self):
    """
    Get all user's circles by creation time descending

    :param (User) self: The acting user
    """
    return list(reversed(sorted(Circle.objects(owner=self), key=lambda circle: circle.created_at)))


def create_circle(self, name):
    """
    Create a circle

    :param (User) self: The acting user
    :param (str) name: name of the circle
    :return (bool): Whether creation is successful.
        If False, name is already taken
    """
    new_circle = Circle()
    new_circle.eid = make_uuid()
    new_circle.owner = self.id
    new_circle.name = name
    try:
        new_circle.save()
    except NotUniqueError:
        return False
    return new_circle.eid


def find_circle(self, circle_id):
    """
    Find a user's circle

    :param (User) self: The acting user
    :param (str) circle_id: ID of the circle
    :return (Circle|bool): the circle object if the circle is found
        If not found, returns False
    """
    circles = Circle.objects(owner=self, eid=circle_id)
    if not circles:
        return False
    return circles[0]


def toggle_member(self, circle, toggled_user):
    """
    Toggle a user's membership in a circle

    :param (User) self: The acting user
    :param (Circle) circle: the circle
    :param (User) toggled_user: toggled user
    :raise (UnauthorizedAccess) when access is unauthorized
    """
    if circle.owner.id == self.id:
        if check_member(circle, toggled_user):
            circle.members.remove(toggled_user)
        else:
            circle.members.append(toggled_user)
        circle.save()
    else:
        raise UnauthorizedAccess()


def delete_circle(self, circle):
    """
    Delete a circle

    :param (User) self: The acting user
    :param (Circle) circle: the circle
    :raise (UnauthorizedAccess) when access is unauthorized
    """
    if circle.owner.id == self.id:
        circle.delete()
    else:
        raise UnauthorizedAccess()


@timer
def check_member(self, user):
    """
    Check whether a user is in the circle

    :param (Circle) self: The checked circle
    :param (User) user: checked user
    :return (bool): whether the user is in the circle
    """
    return len(list(filter(lambda member: member.id == user.id, self.members))) != 0


def backfill_circles_eid():
    backfill_count = 0
    for n in Circle.objects():
        if not n.eid:
            n.eid = make_uuid()
            n.save()
            backfill_count += 1
    if backfill_count != 0:
        print(f'Backfilled {backfill_count} Circle with eid')
    else:
        print("No Circle was backfilled with eid. You can remove backfill code and required the field now!")
