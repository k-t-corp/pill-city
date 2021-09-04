from .base_test_case import BaseTestCase
from mini_gplus.daos.user import sign_up, sign_in, find_user, get_followings, add_following, remove_following


class TestUserDao(BaseTestCase):
    def test_user_successful_check_after_create(self):
        self.assertTrue(sign_up('user1', '1234'))
        self.assertEqual('user1', sign_in('user1', '1234').user_id)

    def test_user_failure_check_wrong_password(self):
        self.assertTrue(sign_up('user1', '1234'))
        self.assertFalse(sign_in('user1', '2345'))

    def test_user_failure_create_duplicate(self):
        self.assertTrue(sign_up('user1', '1234'))
        self.assertFalse(sign_up('user1', '1234'))

    def test_user_successful_find(self):
        self.assertTrue(sign_up('user1', '1234'))
        self.assertEqual('user1', find_user('user1').user_id)

    def test_user_failure_find_not_found(self):
        self.assertTrue(sign_up('user1', '1234'))
        self.assertFalse(find_user('user2'))

    def test_following(self):
        self.assertTrue(sign_up('user1', '1234'))
        self.assertTrue(sign_up('user2', '2345'))
        user1 = find_user('user1')
        user2 = find_user('user2')
        self.assertEqual([], get_followings(user1))

        self.assertTrue(add_following(user1, user2))
        self.assertEqual([user2.id], list(map(lambda u: u.id, get_followings(user1))))
        self.assertFalse(add_following(user1, user2))

        self.assertTrue(remove_following(user1, user2))
        self.assertEqual([], get_followings(user1))
        self.assertFalse(remove_following(user1, user2))
