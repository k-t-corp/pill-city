from bson import ObjectId
from mini_gplus.models import Post
from mini_gplus.utils.profiling import timer
from .cache import r

RPost = "post"


def set_in_post_cache(post: Post):
    r.hset(RPost, str(post.id), post.to_json())


@timer
def get_in_post_cache(oid: ObjectId):
    r_post = r.hget(RPost, str(oid))
    if not r_post:
        post = Post.objects.get(id=oid)
        set_in_post_cache(post)
        return post
    return Post.from_json(r_post.decode('utf-8'))


def exists_in_post_cache(oid: ObjectId):
    return r.hexists(RPost, str(oid))
