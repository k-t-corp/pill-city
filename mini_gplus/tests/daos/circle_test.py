from .base_test_case import BaseTestCase
from mini_gplus.daos.user import create_user, find_user
from mini_gplus.daos.circle import get_circles, create_circle, find_circle, toggle_member, delete_circle
from mini_gplus.daos.exceptions import UnauthorizedAccess


class TestCircleDao(BaseTestCase):
    def test_circle_successful_toggle_after_create_and_find(self):
        # Create user1 and user2
        self.assertTrue(create_user('user1', '1234'))
        self.assertTrue(create_user('user2', '2345'))
        user1 = find_user('user1')
        user2 = find_user('user2')

        # Add user2 to circle1 by user1
        self.assertTrue(create_circle(user1, 'circle1'))
        circle1 = find_circle(user1, 'circle1')
        self.assertEqual([circle1.id], list(map(lambda c: c.id, get_circles(user1))))
        toggle_member(user1, circle1, user2)
        self.assertIn(user2, circle1.members)

        # Remove user2 from circle1 by user1
        toggle_member(user1, circle1, user2)
        self.assertNotIn(user2, circle1.members)

    def test_circle_failure_create_duplicate(self):
        self.assertTrue(create_user('user1', '1234'))
        user1 = find_user('user1')
        self.assertTrue(create_circle(user1, 'circle1'))
        self.assertFalse(create_circle(user1, 'circle1'))

    def test_circle_success_create_duplicate_for_distinct_users(self):
        self.assertTrue(create_user('user1', '1234'))
        self.assertTrue(create_user('user2', '1234'))
        user1 = find_user('user1')
        user2 = find_user('user2')
        self.assertTrue(create_circle(user1, 'circle'))
        user1_circle = find_circle(user1, 'circle')
        self.assertEqual([user1_circle.id], list(map(lambda c: c.id, get_circles(user1))))
        self.assertTrue(create_circle(user2, 'circle'))
        user2_circle = find_circle(user2, 'circle')
        self.assertEqual([user2_circle.id], list(map(lambda c: c.id, get_circles(user2))))

    def test_circle_failure_find_not_found(self):
        self.assertTrue(create_user('user1', '1234'))
        user1 = find_user('user1')
        self.assertFalse(find_circle(user1, 'circle1'))

    def test_circle_failure_find_not_found_another_user(self):
        self.assertTrue(create_user('user1', '1234'))
        self.assertTrue(create_user('user2', '2345'))
        user1 = find_user('user1')
        user2 = find_user('user2')
        self.assertTrue(create_circle(user1, 'secret_circle'))
        self.assertFalse(find_circle(user2, 'secret_circle'))

    def test_circle_failure_toggle_unauthorized(self):
        # Create user1 and user2
        self.assertTrue(create_user('user1', '1234'))
        self.assertTrue(create_user('user2', '2345'))
        user1 = find_user('user1')
        user2 = find_user('user2')

        # Create circle1 by user1 but try to add user2 into circle1 by user2
        self.assertTrue(create_circle(user1, 'circle1'))
        circle1 = find_circle(user1, 'circle1')

        def op():
            toggle_member(user2, circle1, user2)

        self.assertRaises(UnauthorizedAccess, op)

    def test_circle_successful_delete_circle(self):
        self.assertTrue(create_user('user1', '1234'))
        self.assertTrue(create_user('user2', '2345'))
        user1 = find_user('user1')
        user2 = find_user('user2')
        self.assertTrue(create_circle(user1, 'circle1'))
        circle1 = find_circle(user1, 'circle1')
        toggle_member(user1, circle1, user2)
        delete_circle(user1, circle1)
        self.assertFalse(find_circle(user1, 'circle1'))

    def test_circle_failure_delete_circle_unauthorized(self):
        # Create user1 and user2
        self.assertTrue(create_user('user1', '1234'))
        self.assertTrue(create_user('user2', '2345'))
        user1 = find_user('user1')
        user2 = find_user('user2')

        # Create circle1 by user1 but try to delete circle1 from user2
        self.assertTrue(create_circle(user1, 'circle1'))
        circle1 = find_circle(user1, 'circle1')
        toggle_member(user1, circle1, user2)

        def op():
            delete_circle(user2, circle1)

        self.assertRaises(UnauthorizedAccess, op)
