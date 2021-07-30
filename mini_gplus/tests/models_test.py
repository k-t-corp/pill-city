from unittest import TestCase
from mongoengine import connect, disconnect
from mini_gplus.models import User, Post, Comment, UnauthorizedAccess


class TestModels(TestCase):
    def setUp(self):
        self.connection = connect('mongoenginetest', host='mongomock://localhost')

    def tearDown(self):
        self.connection.drop_database("mongoenginetest")
        disconnect()

    ########
    # User #
    ########
    def test_user_successful_check_after_create(self):
        self.assertTrue(User.create('user1', '1234'))
        self.assertEqual('user1', User.check('user1', '1234').user_id)

    def test_user_failure_check_wrong_password(self):
        self.assertTrue(User.create('user1', '1234'))
        self.assertFalse(User.check('user1', '2345'))

    def test_user_failure_create_duplicate(self):
        self.assertTrue(User.create('user1', '1234'))
        self.assertFalse(User.create('user1', '1234'))

    def test_user_successful_find(self):
        self.assertTrue(User.create('user1', '1234'))
        self.assertEqual('user1', User.find('user1').user_id)

    def test_user_failure_find_not_found(self):
        self.assertTrue(User.create('user1', '1234'))
        self.assertFalse(User.find('user2'))

    ##########
    # Circle #
    ##########
    def test_circle_successful_toggle_after_create_and_find(self):
        # Create user1 and user2
        self.assertTrue(User.create('user1', '1234'))
        self.assertTrue(User.create('user2', '2345'))
        user1 = User.find('user1')
        user2 = User.find('user2')

        # Add user2 to circle1 by user1
        self.assertTrue(user1.create_circle('circle1'))
        circle1 = user1.find_circle('circle1')
        self.assertEqual([circle1.id], list(map(lambda c: c.id, user1.get_circles())))
        user1.toggle_member(circle1, user2)
        self.assertIn(user2, circle1.members)

        # Remove user2 from circle1 by user1
        user1.toggle_member(circle1, user2)
        self.assertNotIn(user2, circle1.members)

    def test_circle_failure_create_duplicate(self):
        self.assertTrue(User.create('user1', '1234'))
        user1 = User.find('user1')
        self.assertTrue(user1.create_circle('circle1'))
        self.assertFalse(user1.create_circle('circle1'))

    def test_circle_success_create_duplicate_for_distinct_users(self):
        self.assertTrue(User.create('user1', '1234'))
        self.assertTrue(User.create('user2', '1234'))
        user1 = User.find('user1')
        user2 = User.find('user2')
        self.assertTrue(user1.create_circle('circle'))
        user1_circle = user1.find_circle('circle')
        self.assertEqual([user1_circle.id], list(map(lambda c: c.id, user1.get_circles())))
        self.assertTrue(user2.create_circle('circle'))
        user2_circle = user2.find_circle('circle')
        self.assertEqual([user2_circle.id], list(map(lambda c: c.id, user2.get_circles())))

    def test_circle_failure_find_not_found(self):
        self.assertTrue(User.create('user1', '1234'))
        user1 = User.find('user1')
        self.assertFalse(user1.find_circle('circle1'))

    def test_circle_failure_find_not_found_another_user(self):
        self.assertTrue(User.create('user1', '1234'))
        self.assertTrue(User.create('user2', '2345'))
        user1 = User.find('user1')
        user2 = User.find('user2')
        self.assertTrue(user1.create_circle('secret_circle'))
        self.assertFalse(user2.find_circle('secret_circle'))

    def test_circle_failure_toggle_unauthorized(self):
        # Create user1 and user2
        self.assertTrue(User.create('user1', '1234'))
        self.assertTrue(User.create('user2', '2345'))
        user1 = User.find('user1')
        user2 = User.find('user2')

        # Create circle1 by user1 but try to add user2 into circle1 by user2
        self.assertTrue(user1.create_circle('circle1'))
        circle1 = user1.find_circle('circle1')

        def op():
            user2.toggle_member(circle1, user2)
        self.assertRaises(UnauthorizedAccess, op)

    def test_circle_successful_delete_circle(self):
        self.assertTrue(User.create('user1', '1234'))
        self.assertTrue(User.create('user2', '2345'))
        user1 = User.find('user1')
        user2 = User.find('user2')
        self.assertTrue(user1.create_circle('circle1'))
        circle1 = user1.find_circle('circle1')
        user1.toggle_member(circle1, user2)
        user1.delete_circle(circle1)
        self.assertFalse(user1.find_circle('circle1'))

    def test_circle_failure_delete_circle_unauthorized(self):
        # Create user1 and user2
        self.assertTrue(User.create('user1', '1234'))
        self.assertTrue(User.create('user2', '2345'))
        user1 = User.find('user1')
        user2 = User.find('user2')

        # Create circle1 by user1 but try to delete circle1 from user2
        self.assertTrue(user1.create_circle('circle1'))
        circle1 = user1.find_circle('circle1')
        user1.toggle_member(circle1, user2)

        def op():
            user2.delete_circle(circle1)
        self.assertRaises(UnauthorizedAccess, op)

    #############
    # Following #
    #############
    def test_following(self):
        self.assertTrue(User.create('user1', '1234'))
        self.assertTrue(User.create('user2', '2345'))
        user1 = User.find('user1')
        user2 = User.find('user2')
        self.assertEquals([], user1.get_followings())

        self.assertTrue(user1.add_following(user2))
        self.assertEquals([user2.user_id], list(map(lambda u: u.user_id, user1.get_followings())))
        self.assertFalse(user1.add_following(user2))

        self.assertTrue(user1.remove_following(user2))
        self.assertEquals([], user1.get_followings())
        self.assertFalse(user1.remove_following(user2))

    ##############################################
    # Posts and Comments + Circles and Following #
    ##############################################
    def _assert_user_to_post_privilege(
            self,
            acting_user,
            post,
            owns: bool,
            sees: bool,
            sees_on_profile: bool,
            comments: bool,
            nested_comments: bool
    ):
        if owns:
            self.assertTrue(acting_user.owns_post(post))
        else:
            self.assertFalse(acting_user.owns_post(post))

        if sees:
            self.assertTrue(acting_user.sees_post(post, context_home_or_profile=True))
        else:
            self.assertFalse(acting_user.sees_post(post, context_home_or_profile=True))

        if sees_on_profile:
            self.assertTrue(acting_user.sees_post(post, context_home_or_profile=False))
        else:
            self.assertFalse(acting_user.sees_post(post, context_home_or_profile=False))

        comment1 = None
        if comments:
            acting_user.create_comment('comment1', post)
            comment1 = list(Comment.objects(author=acting_user, content='comment1'))
            self.assertEquals(1, len(comment1))
            comment1 = comment1[0]
            self.assertIn(comment1.id, list(map(lambda c: c.id, post.comments)))
        else:
            def op1():
                acting_user.create_comment('comment1', post)

            self.assertRaises(UnauthorizedAccess, op1)
            # post author creates a new comment
            # in case acting_user needs to mess up with nested commenting later
            naughty_comment_content = 'comment1_for_'+acting_user.user_id+"_to_mess_up_with"
            post.author.create_comment(naughty_comment_content, post)
            comment1 = list(Comment.objects(author=post.author, content=naughty_comment_content))
            self.assertEquals(1, len(comment1))
            comment1 = comment1[0]

        if nested_comments:
            acting_user.create_nested_comment('nested_comment1', comment1, post)
            nested_comment1 = list(Comment.objects(author=acting_user, content='nested_comment1'))
            self.assertEquals(1, len(nested_comment1))
            nested_comment1 = nested_comment1[0]
            self.assertIn(nested_comment1.id, list(map(lambda c: c.id, comment1.comments)))
        else:
            def op2():
                acting_user.create_nested_comment('nested_comment1', comment1, post)

            self.assertRaises(UnauthorizedAccess, op2)

    def test_can_act_on_my_own_public_post(self):
        # Create user1
        self.assertTrue(User.create('user1', '1234'))
        user1 = User.find('user1')

        # Post post1 by user1
        user1.create_post('post1', True, [])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # User1 owns, sees, sees on profile, comments and nested-comments on post1
        self._assert_user_to_post_privilege(
            user1, post1, owns=True, sees=True, sees_on_profile=True, comments=True, nested_comments=True
        )

    def test_can_act_on_others_public_post(self):
        # Create users
        self.assertTrue(User.create('user1', '1234'))
        self.assertTrue(User.create('user2', '2345'))
        self.assertTrue(User.create('user3', '3456'))
        user1 = User.find('user1')
        user2 = User.find('user2')
        user3 = User.find('user3')

        # Create public post1 from user1
        user1.create_post('post1', True, [])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # user2 follows user1
        user2.add_following(user1)

        # User2 not owns but sees, sees on profile, comments and nested-comments on post1
        self._assert_user_to_post_privilege(
            user2, post1, owns=False, sees=True, sees_on_profile=True, comments=True, nested_comments=True
        )

        # User3 not owns nor sees, but sees on profile, comments and nested comments on post1
        self._assert_user_to_post_privilege(
            user3, post1, owns=False, sees=False, sees_on_profile=True, comments=True, nested_comments=True
        )

    def test_can_act_on_my_own_private_post(self):
        # Create user1
        self.assertTrue(User.create('user1', '1234'))
        user1 = User.find('user1')

        # Create circle1
        self.assertTrue(user1.create_circle('circle1'))
        circle1 = user1.find_circle('circle1')

        # Create post1 into circle1
        user1.create_post('post1', False, [circle1])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # User1 owns, sees, sees on profile, comments and nested-comments on post1
        self._assert_user_to_post_privilege(
            user1, post1, owns=True, sees=True, sees_on_profile=True, comments=True, nested_comments=True
        )

    def test_can_act_on_others_private_post(self):
        # Create users
        self.assertTrue(User.create('user1', '1234'))
        self.assertTrue(User.create('user2', '2345'))
        self.assertTrue(User.create('user3', '3456'))
        self.assertTrue(User.create('user4', '4567'))
        user1 = User.find('user1')
        user2 = User.find('user2')
        user3 = User.find('user3')
        user4 = User.find('user4')

        # Create circle1 by user1 and add user2 and user3 into circle1
        self.assertTrue(user1.create_circle('circle1'))
        circle1 = user1.find_circle('circle1')
        user1.toggle_member(circle1, user2)
        user1.toggle_member(circle1, user3)

        # Only user2 follows user1
        user2.add_following(user1)

        # Create post1 by user1 into circle1
        user1.create_post('post1', False, [circle1])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # User2 not owns but sees, sees on profile, comments and nested-comments on post1
        self._assert_user_to_post_privilege(
            user2, post1, owns=False, sees=True, sees_on_profile=True, comments=True, nested_comments=True
        )

        # User3 cannot do anything to post1
        self._assert_user_to_post_privilege(
            user3, post1, owns=False, sees=False, sees_on_profile=True, comments=True, nested_comments=True
        )

        # User4 cannot do anything to post1
        self._assert_user_to_post_privilege(
            user4, post1, owns=False, sees=False, sees_on_profile=False, comments=False, nested_comments=False
        )

    def test_sees_posts(self):
        # Create users
        self.assertTrue(User.create('user1', '1234'))
        self.assertTrue(User.create('user2', '2345'))
        self.assertTrue(User.create('user3', '3456'))
        self.assertTrue(User.create('user4', '4567'))
        user1 = User.find('user1')
        user2 = User.find('user2')
        user3 = User.find('user3')
        user4 = User.find('user4')

        # Create circle1 by user1 and add user2 and user3 into circle1
        self.assertTrue(user1.create_circle('circle1'))
        circle1 = user1.find_circle('circle1')
        user1.toggle_member(circle1, user2)

        # Only user2 follows user1
        user2.add_following(user1)

        # Create post1 by user1 into circle1
        user1.create_post('post1', False, [circle1])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # Create public post2 by user1
        user1.create_post('post2', True, [])
        post2 = Post.objects(content='post2')
        self.assertTrue(1, len(post1))
        post2 = post2[0]

        # User1 sees post2 and post1
        self.assertEquals([post2, post1], user1.sees_posts_on_home())

        # User2 sees post2 and post1
        self.assertEquals([post2, post1], user2.sees_posts_on_home())

        # User3 sees nothing
        self.assertEquals([], user3.sees_posts_on_home())

        # User4 sees nothing
        self.assertEquals([], user4.sees_posts_on_home())
