import uuid
import time
import bleach
from typing import List, Optional
import emoji as emoji_lib
from enum import Enum
from mongoengine import Document, ListField, BooleanField, ReferenceField, StringField, PULL, CASCADE, NULLIFY, \
    NotUniqueError, EnumField
from werkzeug.exceptions import HTTPException
from werkzeug.security import generate_password_hash, check_password_hash


def make_uuid():
    return str(uuid.uuid4())


class UnauthorizedAccess(HTTPException):
    pass


class BadRequest(HTTPException):
    pass


class NotFound(HTTPException):
    pass


class CreatedAtMixin(object):
    @property
    def created_at(self):
        return self.id.generation_time.timestamp()


class Media(Document, CreatedAtMixin):
    object_name = StringField(required=True, unique=True)


class User(Document, CreatedAtMixin):
    user_id = StringField(required=True, unique=True)
    password = StringField(required=True)
    followings = ListField(ReferenceField('User', reverse_delete_rule=PULL), default=[])  # type: List[User]
    avatar = ReferenceField(Media, reverse_delete_rule=NULLIFY)
    profile_pic = StringField(required=False, default="pill1.png")

    ########
    # User #
    ########
    @staticmethod
    def create(user_id, password):
        """
        Create a user
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

    @staticmethod
    def check(user_id, password):
        """
        Check whether the user exists
        :param (str) user_id: user id
        :param (str) password: password
        :return (User|bool): Whether the user exists
        :exception (RuntimeError): If more than one user for the user id is found
        """
        users = User.objects(user_id=user_id)
        found_users = []
        for user in users:
            if check_password_hash(user.password, password):
                found_users.append(user)
        if not found_users:
            return False
        elif len(found_users) == 1:
            return found_users[0]
        else:
            raise RuntimeError('More than one user for user id {} found!'.format(user_id))

    @staticmethod
    def find(user_id):
        """
        Finds the user
        :param (str) user_id: user id
        :return (User|bool): Whether the user exists
        """
        found_users = User.objects(user_id=user_id)
        if not found_users:
            return False
        elif len(found_users) == 1:
            return found_users[0]
        else:
            raise RuntimeError('More than one user for user id {} found!'.format(user_id))

    ########
    # Post #
    ########
    def create_post(self, content, is_public, circles, reshareable, reshared_from, media_list, mentioned_user_ids):
        """
        Create a post for the user
        :param (str) content: the content
        :param (bool) is_public: whether the post is public
        :param (List[Circle]) circles: circles to share with
        :param (bool) reshareable: whether the post is reshareable
        :param (Post) reshared_from: Post object for the resharing post
        :param (List[Media]) media_list: list of media's
        :param (List[str]) mentioned_user_ids: list of mentioned user IDs
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
            if not self.sees_post(sharing_from, context_home_or_profile=False):
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
            self.create_notification(
                notifying_href=new_post.make_href(),
                notifying_action=NotifyingAction.Reshare,
                notified_href=sharing_from.make_href(),
                owner=sharing_from.author
            )

        for mentioned_user_id in mentioned_user_ids:
            self.create_notification(
                notifying_href=new_post.make_href(),
                notifying_action=NotifyingAction.Mention,
                notified_href='',
                owner=User.find(mentioned_user_id)
            )

        return str(new_post.eid)

    @staticmethod
    def get_post(post_id):
        """
        Get a post by its ID
        """
        return Post.objects.get(eid=post_id)

    def owns_post(self, post):
        """
        Whether the user owns a post
        :param (Post) post: the post
        :return (bool): whether the user owns the post
        """
        return self.id == post.author.id

    def sees_post(self, post, context_home_or_profile):
        """
        Whether the user can see a post
        :param (Post) post: the post
        :param (bool) context_home_or_profile: whether the seeing context is home or profile
                        True for home, and False for profile
        :return (bool): whether the user sees the post
        """
        before_owns_ms = time.time_ns() // 1_000_000
        owns = self.owns_post(post)
        print(f"    owns took {time.time_ns() // 1_000_000 - before_owns_ms} ms")

        if owns:
            return True

        before_not_following_ms = time.time_ns() // 1_000_000
        not_following = context_home_or_profile and post.author not in self.followings
        print(f"    not following took {time.time_ns() // 1_000_000 - before_not_following_ms} ms")

        if not_following:
            return False

        before_is_public_ms = time.time_ns() // 1_000_000
        is_public = post.is_public
        print(f"    is public took {time.time_ns() // 1_000_000 - before_is_public_ms} ms")

        if is_public:
            return True
        else:
            for circle in post.circles:
                if circle.check_member(self):
                    return True
        return False

    def retrieves_posts_on_home(self):
        """
        All posts that are visible to the user on home
        :return (List[Post]): all posts that are visible to the user, reverse chronologically ordered
        """
        # todo: pagination
        before_db_ms = time.time_ns() // 1_000_000
        # ordering by id descending is equivalent to ordering by created_at descending
        posts = Post.objects().order_by('-id')
        print(f"  db took {time.time_ns() // 1_000_000 - before_db_ms} ms")

        res = []
        for post in posts:
            before_sees_ms = time.time_ns() // 1_000_000
            sees_post = self.sees_post(post, context_home_or_profile=True)
            print(f"  sees took {time.time_ns() // 1_000_000 - before_sees_ms} ms")

            if sees_post:
                before_append_ms = time.time_ns() // 1_000_000
                res.append(post)
                print(f"  append took {time.time_ns() // 1_000_000 - before_append_ms} ms")

        return res

    def retrieves_posts_on_profile(self, profile_user):
        """
        All posts that are visible to the user on a certain user's profile
        :param (User) profile_user: the user whose profile is being viewed
        :return (List[Post]): all posts that are visible to the user, reverse chronologically ordered
        """
        # todo: pagination
        # ordering by id descending is equivalent to ordering by created_at descending
        posts = Post.objects(author=profile_user).order_by('-id')
        posts = filter(lambda post: self.sees_post(post, context_home_or_profile=False), posts)
        return list(posts)

    def delete_post(self, post):
        """
        Delete a post
        TODO: do not use, no test yet
        :param (Post) post: the post
        :raise (UnauthorizedAccess) when access is unauthorized
        """
        if post.author.id == self.id:
            post.delete()
        else:
            raise UnauthorizedAccess()

    ###########
    # Comment #
    ###########
    def create_comment(self, content, parent_post, mentioned_user_ids):
        """
        Create a comment for the user
        :param (str) content: the content
        :param (Post) parent_post: the post that this comment is attached to
        :param (List[str]) mentioned_user_ids: list of mentioned user IDs
        :return (str) ID of the new comment
        :raise (UnauthorizedAccess) when access is unauthorized
        """
        # context_home_or_profile=False because context_home_or_profile only affects public posts
        # and it is fine for someone who does not see a public post on his home
        # to be able to interact (comment, nested-comment, etc) with this post
        # e.g. context_home_or_profile is reduced to the most permissive because context_home_or_profile only affects
        # public posts
        if self.sees_post(parent_post, context_home_or_profile=False):
            new_comment = Comment()
            new_comment.eid = make_uuid()
            new_comment.author = self.id
            new_comment.content = bleach.clean(content)
            new_comment.save()

            parent_post.comments.append(new_comment)
            parent_post.save()

            self.create_notification(
                notifying_href=new_comment.make_href(parent_post),
                notifying_action=NotifyingAction.Comment,
                notified_href=parent_post.make_href(),
                owner=parent_post.author
            )

            for mentioned_user_id in mentioned_user_ids:
                self.create_notification(
                    notifying_href=new_comment.make_href(parent_post),
                    notifying_action=NotifyingAction.Mention,
                    notified_href='',
                    owner=User.find(mentioned_user_id)
                )

            return str(new_comment.eid)
        else:
            raise UnauthorizedAccess()

    def create_nested_comment(self, content, parent_comment, parent_post, mentioned_user_ids):
        """
        Create a nested comment for the user
        :param (str) content: the content
        :param (Comment) parent_comment: the comment that this nested comment is attached to
        :param (Post) parent_post: the post that this comment is attached to
        :param (List[str]) mentioned_user_ids: list of mentioned user IDs
        :return (str) ID of the new comment
        :raise (UnauthorizedAccess) when access is unauthorized
        """
        # same explanation for context_home_or_profile=False
        if self.sees_post(parent_post, context_home_or_profile=False):
            new_comment = Comment()
            new_comment.eid = make_uuid()
            new_comment.author = self.id
            new_comment.content = bleach.clean(content)
            new_comment.save()

            parent_comment.comments.append(new_comment)
            parent_comment.save()

            self.create_notification(
                notifying_href=new_comment.make_href(parent_post),
                notifying_action=NotifyingAction.Comment,
                notified_href=parent_comment.make_href(parent_post),
                owner=parent_comment.author
            )

            for mentioned_user_id in mentioned_user_ids:
                self.create_notification(
                    notifying_href=new_comment.make_href(parent_post),
                    notifying_action=NotifyingAction.Mention,
                    notified_href='',
                    owner=User.find(mentioned_user_id)
                )

            return str(new_comment.eid)
        else:
            raise UnauthorizedAccess()

    @staticmethod
    def get_comment(comment_id):
        """
        Get a Comment by its ID
        """
        return Comment.objects.get(eid=comment_id)

    def owns_comment(self, comment, parent_post):
        """
        Whether the user owns a comment
        TODO: do not use, no test yet
        :param (Comment) comment: the comment
        :param (Post) parent_post: its parent post
        :return (bool): whether the user owns a comment
        """
        return self.owns_post(parent_post) or self.id == comment.author.id

    def owns_nested_comment(self, comment, parent_comment, parent_post):
        """
        Whether the user owns a nested comment
        TODO: do not use, no test yet
        :param (Comment) comment: the comment
        :param (Comment) parent_comment: comment's parent comment
        :param (Post) parent_post: parent comment's parent post
        :return (bool): whether the user owns the nested comment
        """
        return self.owns_post(parent_post) \
               or self.owns_comment(parent_comment, parent_post) \
               or self.id == comment.author.id

    def delete_comment(self, comment, parent_post):
        """
        Delete a comment
        TODO: do not use, no test yet
        :param (Comment) comment: the comment
        :param (Post) parent_post: comment's parent post
        :raise (UnauthorizedAccess) when access is unauthorized
        """
        if self.owns_comment(comment, parent_post):
            parent_post.comments.remove(comment)
            comment.delete()
        else:
            raise UnauthorizedAccess()

    def delete_nested_comment(self, comment, parent_comment, parent_post):
        """
        Delete a nested comment
        TODO: do not use, no test yet
        :param (Comment) comment: the comment
        :param (Comment) parent_comment: comment's parent comment
        :param (Post) parent_post: parent comment's parent post
        :raise (UnauthorizedAccess) when access is unauthorized
        """
        if self.owns_comment(parent_comment, parent_post):
            parent_comment.comments.remove(comment)
            comment.delete()
        else:
            raise UnauthorizedAccess()

    ############
    # Reaction #
    ############
    def create_reaction(self, emoji, parent_post):
        """
        Create a reaction for the user
        :param (str) emoji: the emoji
        :param (Post) parent_post: the post that this reaction is attached to
        :return (str) ID of the new reaction
        :raise (UnauthorizedAccess) when access is unauthorized
        """
        if self.sees_post(parent_post, context_home_or_profile=False):
            for r in parent_post.reactions:
                if r.author.id == self.id and r.emoji == emoji:
                    raise UnauthorizedAccess()

            if emoji_lib.emoji_count(emoji) != 1:
                raise BadRequest()

            new_reaction = Reaction()
            new_reaction.eid = make_uuid()
            new_reaction.author = self.id
            new_reaction.emoji = emoji
            new_reaction.save()

            parent_post.reactions.append(new_reaction)
            parent_post.save()

            self.create_notification(
                notifying_href=new_reaction.make_href(parent_post),
                notifying_action=NotifyingAction.Reaction,
                notified_href=parent_post.make_href(),
                owner=parent_post.author
            )

            return str(new_reaction.eid)
        else:
            raise UnauthorizedAccess()

    @staticmethod
    def get_reaction(reaction_id):
        return Reaction.objects.get(eid=reaction_id)

    def owns_reaction(self, reaction):
        """
        Whether the user owns a reaction
        :param (Reaction) reaction: the reaction
        :return (bool): whether the user owns a reaction
        """
        return self.id == reaction.author.id

    def delete_reaction(self, reaction, parent_post):
        """
        Delete a reaction
        :param (Reaction) reaction: the comment
        :param (Post) parent_post: reaction's parent post
        :raise (UnauthorizedAccess) when access is unauthorized
        """
        if self.owns_reaction(reaction):
            if reaction not in parent_post.reactions:
                raise NotFound()
            parent_post.reactions.remove(reaction)
            reaction.delete()
        else:
            raise UnauthorizedAccess()

    ##########
    # Circle #
    ##########
    def get_circles(self):
        """
        Get all user's circles by creation time descending
        """
        return list(reversed(sorted(Circle.objects(owner=self), key=lambda circle: circle.created_at)))

    def create_circle(self, name):
        """
        Create a circle
        :param (str) name: name of the circle
        :return (bool): Whether creation is successful.
            If False, name is already taken
        """
        new_circle = Circle()
        new_circle.owner = self.id
        new_circle.name = name
        try:
            new_circle.save()
        except NotUniqueError:
            return False
        return True

    def find_circle(self, name):
        """
        Find a user's circle
        :param (str) name: name of the circle
        :return (Circle|bool): the circle object if the circle is found
            If not found, returns False
        """
        circles = Circle.objects(owner=self, name=name)
        if not circles:
            return False
        elif len(circles) == 1:
            return circles[0]
        else:
            raise RuntimeError(f'More than one circle for circle {name} found!')

    def toggle_member(self, circle, toggled_user):
        """
        Toggle a user's membership in a circle
        :param (Circle) circle: the circle
        :param (User) toggled_user: toggled user
        :raise (UnauthorizedAccess) when access is unauthorized
        """
        if circle.owner.id == self.id:
            if circle.check_member(toggled_user):
                circle.members.remove(toggled_user)
            else:
                circle.members.append(toggled_user)
            circle.save()
        else:
            raise UnauthorizedAccess()

    def delete_circle(self, circle):
        """
        Delete a circle
        :param (Circle) circle: the circle
        :raise (UnauthorizedAccess) when access is unauthorized
        """
        if circle.owner.id == self.id:
            circle.delete()
        else:
            raise UnauthorizedAccess()

    #############
    # Following #
    #############
    def add_following(self, user):
        """
        Add a following
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
        :param (User) user: the removed user
        :return (bool): Whether removing is successful.
        """
        if user not in self.followings:
            return False
        self.followings = list(filter(lambda u: u.user_id != user.user_id, self.followings))
        self.save()
        return True

    def get_followings(self):
        """
        Get all followings
        :return (List[User]): List of following users.
        """
        return list(self.followings)

    ###############
    # Profile Pic #
    ###############

    def update_profile_pic(self, profile_pic):
        """
        update users profile picture
        """
        available_profile_pic = ["pill1.png", "pill2.png", "pill3.png", "pill4.png", "pill5.png", "pill6.png"]
        if profile_pic in available_profile_pic:
            self.profile_pic = profile_pic
            self.save()
        else:
            raise UnauthorizedAccess()

    ################
    # Notification #
    ################
    def create_notification(self, notifying_href, notifying_action, notified_href, owner):
        """
        Create a notification where the notifier is the user. If the user is the owner, then do nothing
        Hrefs can be
            1) Link to post, e.g. /post/post-id
            2) Link to comment or nested comment, e.g. /post/post-id#comment-comment-id
            3) Link to reaction, e.g. /post/post-id#reaction-reaction-id
        :param (str) notifying_href: href for the object that triggers this notification
                                        e.g. if the user creates a comment A on post B,
                                        then notifying_href is /post/B#comment-A
        :param (NotifyingAction) notifying_action: the specific action for the notification
        :param (str) notified_href: href for the object that triggers this notification
                                        e.g. if the user creates a comment A on post B,
                                        then notifying_href is /post/A
        :param (User) owner: The user who is notified
        """
        if self.id == owner.id:
            return
        new_notification = Notification()
        new_notification.notifier = self
        new_notification.notifying_href = notifying_href
        new_notification.notifying_action = notifying_action
        new_notification.notified_href = notified_href
        new_notification.owner = owner
        new_notification.save()

    def get_notifications(self):
        """
        Get all of a user's notifications in reverse chronological order, e.g. latest to earliest
        """
        return list(reversed(sorted(Notification.objects(owner=self), key=lambda n: n.created_at)))


class Circle(Document, CreatedAtMixin):
    owner = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
    name = StringField(required=True)
    members = ListField(ReferenceField(User, reverse_delete_rule=PULL), default=[])  # type: List[User]
    meta = {
        'indexes': [
            {'fields': ('owner', 'name'), 'unique': True}
        ]
    }

    def check_member(self, user):
        """
        Check whether a user is in the circle
        :param (User) user: checked user
        :return (bool): whether the user is in the circle
        """
        return len(list(filter(lambda member: member.id == user.id, self.members))) != 0


class Comment(Document, CreatedAtMixin):
    eid = StringField(required=True)
    author = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
    content = StringField(required=True)
    comments = ListField(ReferenceField('Comment', reverse_delete_rule=PULL), default=[])  # type: List[Comment]

    def make_href(self, parent_post):
        return f"/post/{parent_post.eid}#comment-{self.eid}"


class Reaction(Document, CreatedAtMixin):
    eid = StringField(required=True)
    author = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
    emoji = StringField(required=True)

    def make_href(self, parent_post):
        return f"/post/{parent_post.eid}#reaction-{self.eid}"


class Post(Document, CreatedAtMixin):
    eid = StringField(required=True)
    author = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
    content = StringField(required=True)
    is_public = BooleanField(required=True)
    reactions = ListField(ReferenceField(Reaction, reverse_delete_rule=PULL), default=[])  # type: List[Reaction]
    circles = ListField(ReferenceField(Circle, reverse_delete_rule=PULL), default=[])  # type: List[Circle]
    comments = ListField(ReferenceField(Comment, reverse_delete_rule=PULL), default=[])  # type: List[Comment]
    reshareable = BooleanField(required=False, default=False)
    reshared_from = ReferenceField('Post', required=False, reverse_delete_rule=NULLIFY, default=None)  # type: Post
    media_list = ListField(ReferenceField(Media, reverse_delete_rule=PULL), default=[])  # type: List[Media]

    def make_href(self):
        return f"/post/{self.eid}"


class NotifyingAction(Enum):
    Comment = "comment"
    Mention = "mention"
    Reaction = "reaction"
    Reshare = "reshare"


class Notification(Document, CreatedAtMixin):
    notifier = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
    notifying_href = StringField(required=True)
    notifying_action = EnumField(NotifyingAction, required=True)  # type: NotifyingAction
    notified_href = StringField(required=True)
    owner = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)  # type: User
