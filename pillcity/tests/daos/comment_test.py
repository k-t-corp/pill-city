from .base_test_case import BaseTestCase
from pillcity.daos.user import sign_up, find_user
from pillcity.daos.post import create_post
from pillcity.daos.comment import create_comment, delete_comment
from pillcity.daos.exceptions import UnauthorizedAccess
from pillcity.models import Post, Notification, NotifyingAction


class CommentTest(BaseTestCase):
    def test_delete_comment(self):
        # Create users
        self.assertTrue(sign_up('ghost', '1234'))
        self.assertTrue(sign_up('user1', '1234'))
        self.assertTrue(sign_up('user2', '1234'))
        self.assertTrue(sign_up('user3', '1234'))
        ghost = find_user('ghost')
        user1 = find_user('user1')
        user2 = find_user('user2')
        user3 = find_user('user3')

        # Post reshareable post1 by user1
        create_post(user1, 'post', True, [], True, None, [], [], False)
        post = Post.objects(author=user1)
        self.assertTrue(1, len(post))
        post = post[0]

        # User2 comment on post1 while mentioning user3 and then deletes it
        comment = create_comment(user2, 'comment', post, None, [user3], [])
        deleted_comment = delete_comment(user2, comment.eid, post)

        # User1 should see nullified notification
        user1_notifications = Notification.objects(
            notifying_action=NotifyingAction.Comment,
            notifier=ghost,
            notifying_href=deleted_comment.make_href(post),
            # for some reason this doesn't work, have to assert later
            # notifying_summary='',
            notifying_deleted=True,
            owner=user1,
            notified_href=post.make_href(),
            notified_summary='post',
            notified_deleted=False
        )
        self.assertEqual(1, len(user1_notifications))
        user1_notifications = user1_notifications[0]
        self.assertEqual('', user1_notifications.notifying_summary)

        # User3 should see nullified notification
        user3_notification = Notification.objects(
            notifying_action=NotifyingAction.Mention,
            notifier=ghost,
            # for some reason this doesn't work, have to assert later
            # notifying_href='',
            # notifying_summary='',
            notifying_deleted=False,
            owner=user3,
            notified_href=comment.make_href(post),
            # for some reason this doesn't work, have to assert later
            # notified_summary='',
            notified_deleted=True
        )
        self.assertEqual(1, len(user3_notification))
        user3_notification = user3_notification[0]
        self.assertEqual('', user3_notification.notifying_summary)
        self.assertEqual('', user3_notification.notifying_href)
        self.assertEqual('', user3_notification.notified_summary)

        # The comment should also be nullified
        post = Post.objects(author=user1)
        self.assertTrue(1, len(post))
        post = post[0]
        comment = post.comments2[0]
        self.assertEqual(ghost, comment.author)
        self.assertEqual('', comment.content)
        self.assertTrue(comment.deleted)

    def test_nested_comment_after_delete(self):
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

        # User2 comment on post1 and then deletes it
        comment = create_comment(user2, 'comment', post, None, [], [])
        deleted_comment = delete_comment(user2, comment.eid, post)

        # Even user1 is not able to make a nested comment on the deleted commetn
        def op_create_nested_comment():
            create_comment(user1, 'nested comment', post, deleted_comment, [], [])

        self.assertRaises(UnauthorizedAccess, op_create_nested_comment)
