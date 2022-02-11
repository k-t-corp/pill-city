from pillcity.models import Media


def get_media(object_name):
    return Media.objects.get(id=object_name)


def create_media(object_name):
    media = Media()
    media.id = object_name
    # have to force save for some reason...
    # https://github.com/MongoEngine/mongoengine/issues/1246
    media.save(force_insert=True)

    return media
