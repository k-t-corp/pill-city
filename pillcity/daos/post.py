import bleach
from typing import List, Optional, Union
from pillcity.models import Post, NotifyingAction, User, Circle, Media, Poll, PollChoice
from pillcity.daos.media import delete_media_list
from pillcity.utils.profiling import timer
from pillcity.utils.make_uuid import make_uuid
from pillcity.daos.exceptions import UnauthorizedAccess
from .circle import check_member
from .notification import create_notification, nullify_notifications
from .mention import mention
from .pagination import get_page, poll_latest
from .post_cache import set_in_post_cache, get_in_post_cache, exists_in_post_cache
from .circle_cache import get_in_circle_cache
from .media import use_media_list, get_media

HomePostsPageSize = 10
ProfilePostsPageSize = 10


def create_post(self: User, content: str, is_public: bool, circles: List[Circle], reshareable: bool,
                reshared_from: Optional[Post], media_list: List[Media], mentioned_users: List[User],
                is_update_avatar: bool, poll_choices: List[str], poll_choice_media_object_names: List[str],
                poll_close_by: Optional[int]) \
        -> Union[Post, bool]:
    """
    Create a post for the user

    :param self: The acting user
    :param content: The post content
    :param is_public: Whether the post is public
    :param circles: Circles to share with
    :param reshareable: Whether the post is reshareable
    :param reshared_from: Post object for the resharing post
    :param media_list: List of media's
    :param mentioned_users: List of mentioned users
    :param is_update_avatar: Whether the post is for updating avatar
    :param poll_choices: Poll choices
    :param poll_choice_media_object_names: Media's for poll choices
    :param poll_close_by: Optional time for when the poll should be closed by
    :return ID of the new post
    """
    if not content and not media_list:
        # a post has to have either content or media
        return False

    use_media_list(media_list)

    new_post = Post()
    new_post.eid = make_uuid()
    new_post.author = self.id
    if content:
        new_post.content = bleach.clean(content)
    new_post.is_public = is_public
    new_post.circles = circles
    new_post.media_list = media_list
    new_post.is_update_avatar = is_update_avatar

    if reshared_from and not reshareable:
        # if resharing from a post, this post must also be reshareable, otherwise it's logically wrong
        return False

    # check reshare
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

    # check poll
    if poll_choices:
        p = Poll()
        for i, poll_choice in enumerate(poll_choices):
            pc = PollChoice()
            pc.eid = make_uuid()
            pc.content = poll_choice
            poll_choice_media_object_name = poll_choice_media_object_names[i]
            if poll_choice_media_object_name != 'null':
                pc.media = get_media(poll_choice_media_object_name)
            p.choices.append(pc)
        if poll_close_by:
            p.close_by = poll_close_by
        new_post.poll = p

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


def dangerously_get_post(post_id: str) -> Post:
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


def sees_post(self: User, post: Post, context_home_or_profile: bool) -> bool:
    """
    Whether the user can see a post

    :param self: The acting user
    :param post: the post
    :param context_home_or_profile: whether the seeing context is home or profile
                                    True for home, and False for profile
    :return: whether the user sees the post
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


def is_post_fully_deleted(post: Post):
    """
    A post is considered fully deleted
    if it is marked as deleted and nobody has ever interacted with it, e.g. reaction, comment, poll

    """
    if not post.deleted:
        return False
    if not post.reactions2 and not post.comments2 and not post.poll:
        return True
    return False


@timer
def retrieves_posts_on_home(self: User, from_id: Optional[str]) -> List[Post]:
    """
    All posts that are visible to the user on home, reverse chronologically ordered

    :param self: The acting user
    :param from_id: The Post ID from which home posts should be retrieved
    :return: All posts that are visible to the user, reverse chronologically ordered
    """
    def _filter_post(p):
        return sees_post(self, p, context_home_or_profile=True) and not is_post_fully_deleted(p)

    return get_page(
        mongoengine_model=Post,
        extra_query_args={},
        extra_filter_func=_filter_post,
        from_id=from_id,
        page_count=HomePostsPageSize
    )


@timer
def poll_latest_posts_on_home(self: User, to_id: str) -> List[Post]:
    """
    All posts that are visible to the user on home since the to_id Post, reverse chronologically ordered

    :param self: The acting user
    :param to_id: The Post ID to which home posts should be retrieved
    :return All posts that are visible to the user since the to_id Post, reverse chronologically ordered
    """
    def _filter_post(p):
        return sees_post(self, p, context_home_or_profile=True) and not is_post_fully_deleted(p)

    return poll_latest(
        mongoengine_model=Post,
        extra_query_args={},
        extra_filter_func=_filter_post,
        to_id=to_id
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
        return sees_post(self, p, context_home_or_profile=False) and not is_post_fully_deleted(p)

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
    delete_media_list(post.media_list)
    post.media_list = []
    # Do not delete other people's poll votes lol
    post.save()

    if exists_in_post_cache(post.id):
        # only set in post cache if it already exists
        # post cache should only have reshared posts so it should not cache any deleted post
        set_in_post_cache(post)

    return post


def delete_post_media(self: User, post_id: str) -> Optional[Post]:
    """
    Delete all media for a post

    :param self: The acting user
    :param post_id: The post ID
    """
    post = dangerously_get_post(post_id)
    if self != post.author:
        raise UnauthorizedAccess()

    delete_media_list(post.media_list)
    post.media_list = []
    post.save()

    if exists_in_post_cache(post.id):
        # only set in post cache if it already exists
        # post cache should only have reshared posts so it should not cache any deleted post
        set_in_post_cache(post)

    return post
