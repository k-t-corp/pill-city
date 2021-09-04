from mini_gplus.models import Media


def get_media(object_name):
    return Media.objects.get(object_name=object_name)


def create_media(object_name):
    media = Media()
    media.object_name = object_name
    media.save()

    return media
