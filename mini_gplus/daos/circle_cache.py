from bson import ObjectId
from mini_gplus.models import Circle
from mini_gplus.utils.profiling import timer
from .cache import r

RCircle = "circle"


def set_in_circle_cache(circle: Circle):
    r.hset(RCircle, str(circle.id), circle.to_json())


@timer
def get_in_circle_cache(oid: ObjectId):
    r_circle = r.hget(RCircle, str(oid))
    if not r_circle:
        circle = Circle.objects.get(id=oid)
        set_in_circle_cache(circle)
        return circle
    return Circle.from_json(r_circle.decode('utf-8'))


def delete_from_circle_cache(oid: ObjectId):
    r.hdel(RCircle, str(oid))
