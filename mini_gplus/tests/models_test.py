from unittest import TestCase
from mongoengine import connect, disconnect
from mini_gplus.models import User, Post, UnauthorizedAccess


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
        self.assertTrue(user2.create_circle('circle'))

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

    #########
    # Posts #
    #########
    def test_post_success_create_own_and_see_public_post(self):
        self.assertTrue(User.create('user1', '1234'))
        user1 = User.find('user1')
        user1.create_post('post1', True, [])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]
        self.assertTrue(user1.owns_post(post1))
        self.assertTrue(user1.sees_post(post1))

    def test_post_success_create_own_and_see_public_post_from_another_user(self):
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

        # User2 should see but not own post1
        self.assertFalse(user2.owns_post(post1))
        self.assertTrue(user2.sees_post(post1))

    def test_post_success_create_own_and_see_private_post(self):
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

        # User1 should own and see post1
        self.assertTrue(user1.owns_post(post1))
        self.assertTrue(user1.sees_post(post1))

    def test_post_success_create_own_and_see_private_post_from_another_user(self):
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

        # User1 should own and see post1
        self.assertTrue(user1.owns_post(post1))
        self.assertTrue(user1.sees_post(post1))

        # User2 should not own but see post1
        self.assertFalse(user2.owns_post(post1))
        self.assertTrue(user2.sees_post(post1))

        # User3 should neither own nor see post1
        self.assertFalse(user3.owns_post(post1))
        self.assertFalse(user3.sees_post(post1))

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
