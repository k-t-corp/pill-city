import bleach
from typing import List, Optional, Union
from mini_gplus.models import Post, NotifyingAction, User, Circle, Media
from mini_gplus.utils.profiling import timer
from mini_gplus.utils.make_uuid import make_uuid
from mini_gplus.daos.exceptions import UnauthorizedAccess
from .circle import check_member
from .notification import create_notification, nullify_notifications
from .mention import mention
from .pagination import get_page
from .post_cache import set_in_post_cache, get_in_post_cache, exists_in_post_cache
from .circle_cache import get_in_circle_cache
from .user import find_ghost_user_or_raise

HomePostsPageSize = 10
ProfilePostsPageSize = 10


def create_post(self: User, content: str, is_public: bool, circles: List[Circle], reshareable: bool,
                reshared_from: Optional[Post], media_list: List[Media], mentioned_users: List[User]) \
        -> Union[Post, bool]:
    """
    Create a post for the user

    :param self: The acting user
    :param content: the content
    :param is_public: whether the post is public
    :param circles: circles to share with
    :param reshareable: whether the post is reshareable
    :param reshared_from: Post object for the resharing post
    :param media_list: list of media's
    :param mentioned_users: list of mentioned users
    :return ID of the new post
    """
    # a post has to have either content or media
    if not content and not media_list:
        return False

    new_post = Post()
    new_post.eid = make_uuid()
    new_post.author = self.id
    if content:
        new_post.content = bleach.clean(content)
    new_post.is_public = is_public
    new_post.circles = circles
    new_post.media_list = media_list

    if reshared_from and not reshareable:
        # if resharing from a post, this post must also be reshareable, otherwise it's logically wrong
        return False

    if reshared_from:
        if media_list:
            # when resharing, only allow content (text), e.g. no media
            return False

        if reshared_from.reshared_from:
            # if reshared_from itself is a reshared post, reshare reshared_from's original post
            # reshared_from.reshared_from is LazyReference so need to retrieve the full post
            reshared_from = get_in_post_cache(reshared_from.reshared_from.id)

        # same explanation for context_home_or_profile=False
        if not sees_post(self, reshared_from, context_home_or_profile=False):
            return False

        if not reshared_from.reshareable:
            return False

        new_post.reshared_from = reshared_from

    new_post.reshareable = reshareable
    new_post.save()

    if reshared_from:
        create_notification(
            self,
            notifying_href=new_post.make_href(),
            notifying_summary=new_post.content,
            notifying_action=NotifyingAction.Reshare,
            notified_href=reshared_from.make_href(),
            notified_summary=reshared_from.content,
            owner=reshared_from.author
        )
        # only cache reshared post
        set_in_post_cache(reshared_from)

    mention(
        self,
        notified_href=new_post.make_href(),
        notified_summary=new_post.content,
        mentioned_users=mentioned_users
    )

    return new_post


def dangerously_get_post(post_id: str):
    """
    Get a post by its ID without checking permission
    We don't need to check permission here because this method is only used internally
        e.g. Not exposed to an API

    :param post_id: The post ID
    :return:
    """
    return Post.objects.get(eid=post_id)


def owns_post(self, post):
    """
    Whether the user owns a post

    :param (User) self: The acting user
    :param (Post) post: the post
    :return (bool): whether the user owns the post
    """
    return self.id == post.author.id


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
            circle = get_in_circle_cache(circle.id)
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


def delete_post(self: User, post_id: str) -> Optional[Post]:
    """
    Delete a post by its ID

    :param self: The acting user
    :param post_id: The post ID
    :return:
    """
    post = dangerously_get_post(post_id)
    if self != post.author:
        raise UnauthorizedAccess()

    # do not nullify the user to keep consistent with the below implementation
    nullify_notifications(post.make_href(), post.author)

    # we do not nullify the author in database for a post
    # so that a "skeleton" is left on home and profile
    post.content = ''
    post.deleted = True
    post.reshareable = False
    post.media_list = []
    # TODO: remove poll both on here and on polls collection
    post.save()

    if exists_in_post_cache(post.id):
        # only set in post cache if it already exists
        # post cache should only have reshared posts so it should not cache any deleted post
        set_in_post_cache(post)

    return post
