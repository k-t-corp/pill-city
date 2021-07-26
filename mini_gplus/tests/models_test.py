from unittest import TestCase
from mongoengine import connect, disconnect
from mini_gplus.models import User, Post, Comment, UnauthorizedAccess


class TestModels(TestCase):
    def setUp(self):
        self.connection = connect('mongoenginetest', host='mongomock://localhost')

    def tearDown(self):
        self.connection.drop_database("mongoenginetest")
        disconnect()

    ###
    # User
    ###
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

    ###
    # Circle
    ###
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

    ######################
    # Posts and comments #
    ######################
    def test_post_success_create_own_see_and_comment_public_post(self):
        # Create user1
        self.assertTrue(User.create('user1', '1234'))
        user1 = User.find('user1')

        # Post post1 by user1
        user1.create_post('post1', True, [])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # User1 owns, sees, comments and nested-comments on post1
        self.assertTrue(user1.owns_post(post1))
        self.assertTrue(user1.sees_post(post1))
        user1.create_comment('comment1', post1)
        comment1 = Comment.objects(author=user1, content='comment1')
        self.assertEquals(1, len(comment1))
        comment1 = comment1[0]
        user1.create_nested_comment('nested_comment1', comment1, post1)
        nested_comment1 = Comment.objects(author=user1, content='nested_comment1')
        self.assertEquals(1, len(nested_comment1))

    def test_post_success_create_own_see_and_comment_public_post_from_another_user(self):
        # Create user1 and user2
        self.assertTrue(User.create('user1', '1234'))
        self.assertTrue(User.create('user2', '2345'))
        user1 = User.find('user1')
        user2 = User.find('user2')

        # Create public post1 from user1
        user1.create_post('post1', True, [])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # User2 not owns but sees, comments and nested-comments on post1
        self.assertFalse(user2.owns_post(post1))
        self.assertTrue(user2.sees_post(post1))
        user2.create_comment('comment1', post1)
        comment1 = Comment.objects(author=user2, content='comment1')
        self.assertEquals(1, len(comment1))
        comment1 = comment1[0]
        user2.create_nested_comment('nested_comment1', comment1, post1)
        nested_comment1 = Comment.objects(author=user2, content='nested_comment1')
        self.assertEquals(1, len(nested_comment1))

    def test_post_success_create_own_see_and_comment_private_post(self):
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

        # User1 owns, sees, comments and nested-comments on post1
        self.assertTrue(user1.owns_post(post1))
        self.assertTrue(user1.sees_post(post1))
        user1.create_comment('comment1', post1)
        comment1 = Comment.objects(author=user1, content='comment1')
        self.assertEquals(1, len(comment1))
        comment1 = comment1[0]
        user1.create_nested_comment('nested_comment1', comment1, post1)
        nested_comment1 = Comment.objects(author=user1, content='nested_comment1')
        self.assertEquals(1, len(nested_comment1))

    def test_post_success_create_own_see_and_comment_private_post_from_another_user(self):
        # Create user1, user2 and user3
        self.assertTrue(User.create('user1', '1234'))
        self.assertTrue(User.create('user2', '2345'))
        self.assertTrue(User.create('user3', '3456'))
        user1 = User.find('user1')
        user2 = User.find('user2')
        user3 = User.find('user3')

        # Create circle1 by user1 and add user2 into circle2 but not user3
        self.assertTrue(user1.create_circle('circle1'))
        circle1 = user1.find_circle('circle1')
        user1.toggle_member(circle1, user2)

        # Create post1 by user1 into circle1
        user1.create_post('post1', False, [circle1])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # User1 owns and sees post1
        self.assertTrue(user1.owns_post(post1))
        self.assertTrue(user1.sees_post(post1))

        # User2 not owns but sees and (nested) comments on post1
        self.assertFalse(user2.owns_post(post1))
        self.assertTrue(user2.sees_post(post1))
        user2.create_comment('comment1', post1)
        comment1 = Comment.objects(author=user2, content='comment1')
        self.assertEquals(1, len(comment1))
        comment1 = comment1[0]
        user2.create_nested_comment('nested_comment1', comment1, post1)
        nested_comment1 = Comment.objects(author=user2, content='nested_comment1')
        self.assertEquals(1, len(nested_comment1))

        # User3 neither own nor see nor (nested) comments on post1
        self.assertFalse(user3.owns_post(post1))
        self.assertFalse(user3.sees_post(post1))

        def op1():
            user3.create_comment('comment2', post1)
        self.assertRaises(UnauthorizedAccess, op1)

        def op2():
            user3.create_nested_comment('nested_comment2', comment1, post1)
        self.assertRaises(UnauthorizedAccess, op2)

    def test_post_success_sees_posts_from_another_user(self):
        # Create user1, user2 and user3
        self.assertTrue(User.create('user1', '1234'))
        self.assertTrue(User.create('user2', '2345'))
        self.assertTrue(User.create('user3', '3456'))
        user1 = User.find('user1')
        user2 = User.find('user2')
        user3 = User.find('user3')

        # Create circle1 by user1 and add user2 into circle2 but not user3
        self.assertTrue(user1.create_circle('circle1'))
        circle1 = user1.find_circle('circle1')
        user1.toggle_member(circle1, user2)

        # Create post1 by user1 into circle1
        user1.create_post('post1', False, [circle1])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # Create public post2
        user1.create_post('post2', True, [])
        post2 = Post.objects(content='post2')
        self.assertTrue(1, len(post1))
        post2 = post2[0]

        # User1 sees post2 and post1
        self.assertEquals([post2, post1], user1.sees_posts())

        # User2 sees post2 and post1
        self.assertEquals([post2, post1], user2.sees_posts())

        # User3 sees post2
        self.assertEquals([post2], user3.sees_posts())
