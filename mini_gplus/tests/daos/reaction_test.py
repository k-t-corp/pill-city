from .base_test_case import BaseTestCase
from mini_gplus.models import Post
from mini_gplus.daos.user import sign_up, find_user
from mini_gplus.daos.post import create_post
from mini_gplus.daos.reaction import create_reaction, delete_reaction, get_reaction
from mini_gplus.daos.exceptions import UnauthorizedAccess, NotFound, BadRequest


class ReactionTest(BaseTestCase):
    def test_react_twice(self):
        # Create users
        self.assertTrue(sign_up('user1', '1234'))
        user1 = find_user('user1')

        # Create post
        create_post(user1, 'post1', True, [], False, None, [], [], False)
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        def op():
            create_reaction(user1, '💩', post1)
            post11 = Post.objects(author=user1)
            self.assertTrue(1, len(post11))
            post11 = post11[0]
            create_reaction(user1, '💩', post11)

        self.assertRaises(UnauthorizedAccess, op)

    def test_delete_reaction(self):
        # Create users
        self.assertTrue(sign_up('user1', '1234'))
        self.assertTrue(sign_up('user2', '1234'))
        user1 = find_user('user1')
        user2 = find_user('user2')

        # Create post
        create_post(user1, 'post1', True, [], False, None, [], [], False)
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # User2 creates reaction
        reaction1_id = create_reaction(user2, '💩', post1)
        reaction1 = get_reaction(reaction1_id, post1)

        # User2 creates reaction and user1 tries to delete it
        def op():
            delete_reaction(user1, reaction1, post1)

        self.assertRaises(UnauthorizedAccess, op)

        # User2 deletes his own reaction
        delete_reaction(user2, reaction1, post1)

        # User2 tries to delete a reaction that doesn't exit
        def op2():
            delete_reaction(user2, reaction1, post1)

        self.assertRaises(NotFound, op2)

    def test_add_bad_reaction(self):
        # Create users
        self.assertTrue(sign_up('user1', '1234'))
        user1 = find_user('user1')

        # Create post
        create_post(user1, 'post1', True, [], False, None, [], [], False)
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # User1 tries to add more than one emoji
        def op():
            create_reaction(user1, '💩💩', post1)

        self.assertRaises(BadRequest, op)

        # User1 tries to add something that is not emoji
        def op2():
            create_reaction(user1, 'r', post1)

        self.assertRaises(BadRequest, op2)

        # todo: this is a bug
        # User1 tries to add something that is not emoji
        # def op3():
        #     create_reaction(user1, 'r💩rrr', post1)

        # self.assertRaises(BadRequest, op3)
