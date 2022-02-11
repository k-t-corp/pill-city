from .base_test_case import BaseTestCase
from pillcity.daos.user import sign_up, find_user
from pillcity.daos.post import create_post, delete_post
from pillcity.daos.comment import create_comment
from pillcity.daos.reaction import create_reaction
from pillcity.daos.exceptions import UnauthorizedAccess
from pillcity.models import Post, Notification, NotifyingAction


class PostTest(BaseTestCase):
    def test_delete_post(self):
        # Create users
        self.assertTrue(sign_up('ghost', '1234'))
        self.assertTrue(sign_up('user1', '1234'))
        self.assertTrue(sign_up('user2', '1234'))
        self.assertTrue(sign_up('user3', '1234'))
        user1 = find_user('user1')
        user2 = find_user('user2')
        user3 = find_user('user3')

        # Post reshareable post1 by user1 while mentioning user3
        create_post(user1, 'post', True, [], True, None, [], [user3], False)
        post = Post.objects(author=user1)
        self.assertTrue(1, len(post))
        post = post[0]

        # User2 tries to delete post1 but fails
        def op_user2_deletes_post():
            delete_post(user2, post.eid)

        self.assertRaises(UnauthorizedAccess, op_user2_deletes_post)

        # User1 deletes the post
        deleted_post = delete_post(user1, post.eid)

        # User3 should see nullified notifiaction
        user3_notification = Notification.objects(
            notifying_action=NotifyingAction.Mention,
            notifier=user1,  # user is not nullified
            # for some reason this doesn't work, have to assert later
            # notifying_href='',
            # notifying_summary='',
            notifying_deleted=False,
            owner=user3,
            notified_href=deleted_post.make_href(),
            # for some reason this doesn't work, have to assert later
            # notified_summary='',
            notified_deleted=True
        )
        self.assertEqual(1, len(user3_notification))
        user3_notification = user3_notification[0]
        self.assertEqual('', user3_notification.notifying_href)
        self.assertEqual('', user3_notification.notifying_summary)
        self.assertEqual('', user3_notification.notified_summary)

        # The post should also be nullified
        post = Post.objects(author=user1)
        self.assertTrue(1, len(post))
        post = post[0]
        self.assertEqual('', post.content)
        self.assertTrue(post.deleted)
        self.assertFalse(post.reshareable)
        self.assertEqual([], post.media_list)

    def test_comment_and_reation_after_delete(self):
        # Create users
        self.assertTrue(sign_up('ghost', '1234'))
        self.assertTrue(sign_up('user1', '1234'))
        self.assertTrue(sign_up('user2', '1234'))
        user1 = find_user('user1')
        user2 = find_user('user2')

        # Post reshareable post1 by user1
        create_post(user1, 'post', True, [], True, None, [], [], False)
        post = Post.objects(author=user1)
        self.assertTrue(1, len(post))
        post = post[0]

        # User1 deletes the post
        deleted_post = delete_post(user1, post.eid)

        # Even user1 is not able to make a comment or reaction
        def op_comment():
            create_comment(user1, '', deleted_post, None, [], [])

        self.assertRaises(UnauthorizedAccess, op_comment)

        def op_react():
            create_reaction(user1, '💩', deleted_post)

        self.assertRaises(UnauthorizedAccess, op_react)
