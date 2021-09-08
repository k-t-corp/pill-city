import bleach
from typing import Optional
from mini_gplus.models import Post, NotifyingAction
from mini_gplus.utils.profiling import timer
from mini_gplus.utils.make_uuid import make_uuid
from .circle import check_member
from .notification import create_notification
from .mention import mention
from .pagination import get_page

HomePostsPageSize = 5
ProfilePostsPageSize = 10


def create_post(self, content, is_public, circles, reshareable, reshared_from, media_list, mentioned_users):
    """
    Create a post for the user

    :param (User) self: The acting user
    :param (str) content: the content
    :param (bool) is_public: whether the post is public
    :param (List[Circle]) circles: circles to share with
    :param (bool) reshareable: whether the post is reshareable
    :param (Post|None) reshared_from: Post object for the resharing post
    :param (List[Media]) media_list: list of media's
    :param (List[User]) mentioned_users: list of mentioned users
    :return (str) ID of the new post
    """
    new_post = Post()
    new_post.eid = make_uuid()
    new_post.author = self.id
    new_post.content = bleach.clean(content)
    new_post.is_public = is_public
    new_post.circles = circles
    new_post.media_list = media_list
    sharing_from = None  # type: Optional[Post]
    if reshared_from:
        if media_list:
            # when resharing, only allow content (text), e.g. no media
            return False
        if reshared_from.reshared_from:
            # if reshared_from itself is a reshared post, reshare reshared_from's original post
            sharing_from = reshared_from.reshared_from
        else:
            sharing_from = reshared_from
        # same explanation for context_home_or_profile=False
        if not sees_post(self, sharing_from, context_home_or_profile=False):
            return False
        if not sharing_from.reshareable:
            return False
        new_post.reshared_from = sharing_from
    if reshared_from and not reshareable:
        # if resharing from a post, this post must also be reshareable, otherwise it's logically wrong
        return False
    new_post.reshareable = reshareable
    new_post.save()

    if sharing_from:
        create_notification(
            self,
            notifying_href=new_post.make_href(),
            notifying_action=NotifyingAction.Reshare,
            notified_href=sharing_from.make_href(),
            owner=sharing_from.author
        )

    mention(
        self,
        notified_href=new_post.make_href(),
        mentioned_users=mentioned_users
    )

    return str(new_post.eid)


def get_post(post_id):
    """
    Get a post by its ID
    """
    return Post.objects.get(eid=post_id)


@timer
def owns_post(self, post):
    """
    Whether the user owns a post

    :param (User) self: The acting user
    :param (Post) post: the post
    :return (bool): whether the user owns the post
    """
    return self.id == post.author.id


@timer
def sees_post(self, post, context_home_or_profile):
    """
    Whether the user can see a post

    :param (User) self: The acting user
    :param (Post) post: the post
    :param (bool) context_home_or_profile: whether the seeing context is home or profile
                    True for home, and False for profile
    :return (bool): whether the user sees the post
    """
    if owns_post(self, post):
        return True
    if context_home_or_profile and post.author not in self.followings:
        return False
    if post.is_public:
        return True
    else:
        for circle in post.circles:
            if check_member(circle, self):
                return True
    return False


@timer
def retrieves_posts_on_home(self, from_id):
    """
    All posts that are visible to the user on home

    :param (User) self: The acting user
    :param (str|None) from_id: The acting Post_id from which home posts should be retrieved
    :return (List[Post]): all posts that are visible to the user, reverse chronologically ordered
    """
    def _filter_post(p):
        return sees_post(self, p, context_home_or_profile=True)

    return get_page(
        mongoengine_model=Post,
        extra_query_args={},
        extra_filter_func=_filter_post,
        from_id=from_id,
        page_count=HomePostsPageSize
    )


def retrieves_posts_on_profile(self, profile_user, from_id):
    """
    All posts that are visible to the user on a certain user's profile

    :param (User) self: The acting user
    :param (User) profile_user: the user whose profile is being viewed
    :param (str|None) from_id: The acting Post_id from which home posts should be retrieved
    :return (List[Post]): all posts that are visible to the user, reverse chronologically ordered
    """
    def _filter_post(p):
        return sees_post(self, p, context_home_or_profile=False)

    return get_page(
        mongoengine_model=Post,
        extra_query_args={
            'author': profile_user
        },
        extra_filter_func=_filter_post,
        from_id=from_id,
        page_count=ProfilePostsPageSize
    )
