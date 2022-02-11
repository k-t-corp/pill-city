import uuid


def make_uuid():
    return str(uuid.uuid4())


def make_dashless_uuid():
    return make_uuid().replace("-", "")
