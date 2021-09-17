from .base_test_case import BaseTestCase
from mini_gplus.models import Post, NotifyingAction, Notification
from mini_gplus.daos.user import sign_up, find_user, add_following
from mini_gplus.daos.circle import create_circle, find_circle, toggle_member
from mini_gplus.daos.post import create_post, get_post, owns_post, sees_post, retrieves_posts_on_home, \
    retrieves_posts_on_profile
from mini_gplus.daos.comment import create_comment, create_nested_comment
from mini_gplus.daos.reaction import create_reaction, get_reaction
from mini_gplus.daos.exceptions import UnauthorizedAccess


class InteractionsTest(BaseTestCase):
    def _assert_user_to_post_privilege(
            self,
            acting_user,
            post,
            owns: bool,
            sees: bool,
            sees_on_profile: bool,
            comments: bool,
            nested_comments: bool,
            react_once: bool,
            reshare: bool
    ):
        if owns:
            self.assertTrue(owns_post(acting_user, post))
        else:
            self.assertFalse(owns_post(acting_user, post))

        if sees:
            self.assertTrue(sees_post(acting_user, post, context_home_or_profile=True))
        else:
            self.assertFalse(sees_post(acting_user, post, context_home_or_profile=True))

        if sees_on_profile:
            self.assertTrue(sees_post(acting_user, post, context_home_or_profile=False))
        else:
            self.assertFalse(sees_post(acting_user, post, context_home_or_profile=False))

        comment1 = None
        if comments:
            comment1 = create_comment(acting_user, 'comment1', post, [])
            self.assertIn(comment1.eid, list(map(lambda c: c.eid, post.comments2)))
            if acting_user.id != post.author.id:
                self.assertEqual(1, len(Notification.objects(notifier=acting_user,
                                                             notifying_href=f"/post/{post.eid}#comment-{comment1.eid}",
                                                             notifying_action=NotifyingAction.Comment,
                                                             notified_href=f"/post/{post.eid}",
                                                             owner=post.author.id)))
        else:
            def op1():
                create_comment(acting_user, 'comment1', post, [])

            self.assertRaises(UnauthorizedAccess, op1)
            comment1 = create_comment(post.author, 'comment1', post, [])

        if nested_comments:
            nested_comment1 = create_nested_comment(acting_user, 'nested_comment1', comment1, post, [])
            self.assertIn(nested_comment1.eid, list(map(lambda c: c.eid, comment1.comments)))
            if acting_user.id != comment1.author.id:
                self.assertEqual(1, len(Notification.objects(notifier=acting_user,
                                                             notifying_href=f"/post/{post.eid}"
                                                                            f"#comment-{nested_comment1.eid}",
                                                             notifying_action=NotifyingAction.Comment,
                                                             notified_href=f"/post/{post.eid}#comment-{comment1.eid}",
                                                             owner=comment1.author.id)))
        else:
            def op2():
                create_nested_comment(acting_user, 'nested_comment1', comment1, post, [])

            self.assertRaises(UnauthorizedAccess, op2)

        # has to re-query post object because author in reactions won't be filled as an actual User object
        post = get_post(post.eid)
        if react_once:
            reaction_id = create_reaction(acting_user, "💩", post)
            reaction1 = get_reaction(reaction_id, post)
            self.assertIn(reaction1.eid, list(map(lambda r: r.eid, post.reactions2)))
            if acting_user.id != post.author.id:
                self.assertEqual(1, len(Notification.objects(notifier=acting_user,
                                                             notifying_href=f"/post/{post.eid}#reaction-{reaction_id}",
                                                             notifying_action=NotifyingAction.Reaction,
                                                             notified_href=f"/post/{post.eid}",
                                                             owner=post.author.id)))
        else:
            def op3():
                create_reaction(acting_user, '💩', post)

            self.assertRaises(UnauthorizedAccess, op3)

        post = get_post(post.eid)
        if reshare:
            new_post_id = create_post(acting_user, 'resharing', is_public=True, circles=[], reshareable=True,
                                      reshared_from=post, media_list=[], mentioned_users=[])
            self.assertEqual(1, len(Post.objects(eid=new_post_id)))
            new_post = get_post(new_post_id)
            self.assertEqual(post.id, new_post.reshared_from.id)
            if acting_user.id != post.author.id:
                self.assertEqual(1, len(Notification.objects(notifier=acting_user,
                                                             notifying_href=f"/post/{new_post_id}",
                                                             notifying_action=NotifyingAction.Reshare,
                                                             notified_href=f"/post/{post.eid}",
                                                             owner=post.author.id)))
        else:
            self.assertFalse(create_post(acting_user, 'resharing', is_public=True, circles=[], reshareable=True,
                                         reshared_from=post, media_list=[], mentioned_users=[]))

    def test_can_act_on_my_own_public_post(self):
        # Create user1
        self.assertTrue(sign_up('user1', '1234'))
        user1 = find_user('user1')

        # Post reshareable post1 by user1
        create_post(user1, 'post1', True, [], True, None, [], [])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # User1 owns, sees, sees on profile, comments, nested-comments, reacts and reshares on post1
        self._assert_user_to_post_privilege(
            user1, post1, owns=True, sees=True, sees_on_profile=True, comments=True, nested_comments=True,
            react_once=True, reshare=True
        )

    def test_chained_reshare_on_my_own_public_post(self):
        # Create user1
        self.assertTrue(sign_up('user1', '1234'))
        user1 = find_user('user1')

        # Post reshareable post1 by user1
        create_post(user1, 'post1', True, [], True, None, [], [])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        post2_id = create_post(user1, 'resharing post1', True, [], True, post1, [], [])
        post2 = get_post(post2_id)
        post3_id = create_post(user1, 'resharing post2', True, [], True, post2, [], [])
        post3 = get_post(post3_id)
        self.assertEqual(post1.id, post2.reshared_from.id)
        self.assertEqual(post1.id, post3.reshared_from.id)

    def test_can_act_on_others_public_post(self):
        # Create users
        self.assertTrue(sign_up('user1', '1234'))
        self.assertTrue(sign_up('user2', '2345'))
        self.assertTrue(sign_up('user3', '3456'))
        user1 = find_user('user1')
        user2 = find_user('user2')
        user3 = find_user('user3')

        # Create reshareable public post1 from user1
        post1_id = create_post(user1, 'post1', True, [], True, None, [], [])
        post1 = get_post(post1_id)

        # Create non-reshareable public post2 from user1
        post2_id = create_post(user1, 'post2', True, [], False, None, [], [])
        post2 = get_post(post2_id)

        # user2 follows user1
        add_following(user2, user1)

        # User2 not owns but sees, sees on profile, comments, nested-comments, reacts and reshares on post1
        self._assert_user_to_post_privilege(
            user2, post1, owns=False, sees=True, sees_on_profile=True, comments=True, nested_comments=True,
            react_once=True, reshare=True
        )

        # User2 cannot reshare on post2
        self._assert_user_to_post_privilege(
            user2, post2, owns=False, sees=True, sees_on_profile=True, comments=True, nested_comments=True,
            react_once=True, reshare=False
        )

        # User3 not owns nor sees, but sees on profile, comments, nested-comments, reacts and reshares on post1
        self._assert_user_to_post_privilege(
            user3, post1, owns=False, sees=False, sees_on_profile=True, comments=True, nested_comments=True,
            react_once=True, reshare=True
        )

        # User3 cannot reshare on post2
        self._assert_user_to_post_privilege(
            user3, post2, owns=False, sees=False, sees_on_profile=True, comments=True, nested_comments=True,
            react_once=True, reshare=False
        )

    def test_can_act_on_my_own_private_post(self):
        # Create user1
        self.assertTrue(sign_up('user1', '1234'))
        user1 = find_user('user1')

        # Create circle1
        circle1_id = create_circle(user1, 'circle1')
        circle1 = find_circle(user1, circle1_id)

        # Create post1 into circle1
        create_post(user1, 'post1', False, [circle1], True, None, [], [])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # User1 owns, sees, sees on profile, comments, nested-comments, reacts and reshares on post1
        self._assert_user_to_post_privilege(
            user1, post1, owns=True, sees=True, sees_on_profile=True, comments=True, nested_comments=True,
            react_once=True, reshare=True
        )

    def test_can_act_on_others_private_post(self):
        # Create users
        self.assertTrue(sign_up('user1', '1234'))
        self.assertTrue(sign_up('user2', '2345'))
        self.assertTrue(sign_up('user3', '3456'))
        self.assertTrue(sign_up('user4', '4567'))
        user1 = find_user('user1')
        user2 = find_user('user2')
        user3 = find_user('user3')
        user4 = find_user('user4')

        # Create circle1 by user1 and add user2 and user3 into circle1
        circle1_id = create_circle(user1, 'circle1')
        circle1 = find_circle(user1, circle1_id)
        toggle_member(user1, circle1, user2)
        toggle_member(user1, circle1, user3)

        # Only user2 follows user1
        add_following(user2, user1)

        # Create reshareable post1 by user1 into circle1
        post1_id = create_post(user1, 'post1', False, [circle1], True, None, [], [])
        post1 = get_post(post1_id)

        # Create non-reshareable post2 by user1 into circle1
        post2_id = create_post(user1, 'post2', False, [circle1], False, None, [], [])
        post2 = get_post(post2_id)

        # User2 not owns but sees, sees on profile, comments, nested-comments, reacts and reshares on post1
        self._assert_user_to_post_privilege(
            user2, post1, owns=False, sees=True, sees_on_profile=True, comments=True, nested_comments=True,
            react_once=True, reshare=True
        )

        # User2 cannot reshare on post2
        self._assert_user_to_post_privilege(
            user2, post2, owns=False, sees=True, sees_on_profile=True, comments=True, nested_comments=True,
            react_once=True, reshare=False
        )

        # User3 not owns nor sees, but sees on profile, comments, nested-comments, reacts and reshares on post1
        self._assert_user_to_post_privilege(
            user3, post1, owns=False, sees=False, sees_on_profile=True, comments=True, nested_comments=True,
            react_once=True, reshare=True
        )

        # User3 cannot reshare on post2
        self._assert_user_to_post_privilege(
            user3, post2, owns=False, sees=False, sees_on_profile=True, comments=True, nested_comments=True,
            react_once=True, reshare=False
        )

        # User4 cannot do anything to post1
        self._assert_user_to_post_privilege(
            user4, post1, owns=False, sees=False, sees_on_profile=False, comments=False, nested_comments=False,
            react_once=False, reshare=False
        )

        # User4 cannot do anything to post2
        self._assert_user_to_post_privilege(
            user4, post2, owns=False, sees=False, sees_on_profile=False, comments=False, nested_comments=False,
            react_once=False, reshare=False
        )

    def test_retrieves_posts(self):
        # Create users
        self.assertTrue(sign_up('user1', '1234'))
        self.assertTrue(sign_up('user2', '2345'))
        self.assertTrue(sign_up('user3', '3456'))
        self.assertTrue(sign_up('user4', '4567'))
        user1 = find_user('user1')
        user2 = find_user('user2')
        user3 = find_user('user3')
        user4 = find_user('user4')

        # Create circle1 by user1 and add user2 and user3 into circle1
        circle1_id = create_circle(user1, 'circle1')
        circle1 = find_circle(user1, circle1_id)
        toggle_member(user1, circle1, user2)
        toggle_member(user1, circle1, user3)

        # Only user2 follows user1
        add_following(user2, user1)

        # Create post1 by user1 into circle1
        create_post(user1, 'post1', False, [circle1], False, None, [], [])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # Create public post2 by user1
        create_post(user1, 'post2', True, [], False, None, [], [])
        post2 = Post.objects(content='post2')
        self.assertTrue(1, len(post2))
        post2 = post2[0]

        # User1 sees post2 and post1 on home and user1's profile
        self.assertEqual([post2, post1], retrieves_posts_on_home(user1, None))
        self.assertEqual([post2, post1], retrieves_posts_on_profile(user1, user1, None))

        # User2 sees post2 and post1 on home and user1's profile
        self.assertEqual([post2, post1], retrieves_posts_on_home(user2, None))
        self.assertEqual([post2, post1], retrieves_posts_on_profile(user2, user1, None))

        # User3 sees nothing on home and post2 and post1 on user1's profile
        self.assertEqual([], retrieves_posts_on_home(user3, None))
        self.assertEqual([post2, post1], retrieves_posts_on_profile(user3, user1, None))

        # User4 sees nothing on home and post2 on user1's profile
        self.assertEqual([], retrieves_posts_on_home(user4, None))
        self.assertEqual([post2], retrieves_posts_on_profile(user4, user1, None))
