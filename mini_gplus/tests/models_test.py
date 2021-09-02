from unittest import TestCase
from mongoengine import connect, disconnect
from mini_gplus.models import User, Post, UnauthorizedAccess, Reaction, NotFound, BadRequest


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
        self.assertEqual([], user1.get_followings())

        self.assertTrue(user1.add_following(user2))
        self.assertEqual([user2.user_id], list(map(lambda u: u.user_id, user1.get_followings())))
        self.assertFalse(user1.add_following(user2))

        self.assertTrue(user1.remove_following(user2))
        self.assertEqual([], user1.get_followings())
        self.assertFalse(user1.remove_following(user2))

    ###############################################################################
    # Posts, comments, nested-comments, reacts and reshares + circles + following #
    ###############################################################################
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
            comment_id = acting_user.create_comment('comment1', post)
            comment1 = acting_user.get_comment(comment_id)
            self.assertIn(comment1.id, list(map(lambda c: c.id, post.comments)))
        else:
            def op1():
                acting_user.create_comment('comment1', post)

            self.assertRaises(UnauthorizedAccess, op1)
            comment_id = post.author.create_comment('comment1', post)
            comment1 = acting_user.get_comment(comment_id)

        if nested_comments:
            nested_comment_id = acting_user.create_nested_comment('nested_comment1', comment1, post)
            nested_comment1 = acting_user.get_comment(nested_comment_id)
            self.assertIn(nested_comment1.id, list(map(lambda c: c.id, comment1.comments)))
        else:
            def op2():
                acting_user.create_nested_comment('nested_comment1', comment1, post)

            self.assertRaises(UnauthorizedAccess, op2)

        # has to re-query post object because author in reactions won't be filled as an actual User object
        post = acting_user.get_post(post.eid)
        if react_once:
            reaction_id = acting_user.create_reaction("💩", post)
            reaction1 = acting_user.get_reaction(reaction_id)
            self.assertIn(reaction1.id, list(map(lambda c: c.id, post.reactions)))
        else:
            def op3():
                acting_user.create_reaction('💩', post)

            self.assertRaises(UnauthorizedAccess, op3)

        post = acting_user.get_post(post.eid)
        if reshare:
            new_post_id = acting_user.create_post('resharing', is_public=True, circles=[], reshareable=True,
                                                  reshared_from=post, media_list=[])
            self.assertEqual(1, len(Post.objects(eid=new_post_id)))
            new_post = acting_user.get_post(new_post_id)
            self.assertEqual(post.id, new_post.reshared_from.id)
        else:
            self.assertFalse(acting_user.create_post('resharing', is_public=True, circles=[], reshareable=True,
                                                     reshared_from=post, media_list=[]))

    def test_can_act_on_my_own_public_post(self):
        # Create user1
        self.assertTrue(User.create('user1', '1234'))
        user1 = User.find('user1')

        # Post reshareable post1 by user1
        user1.create_post('post1', True, [], True, None, [])
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
        self.assertTrue(User.create('user1', '1234'))
        user1 = User.find('user1')

        # Post reshareable post1 by user1
        user1.create_post('post1', True, [], True, None, [])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        post2_id = user1.create_post('resharing post1', True, [], True, post1, [])
        post2 = user1.get_post(post2_id)
        post3_id = user1.create_post('resharing post2', True, [], True, post2, [])
        post3 = user1.get_post(post3_id)
        self.assertEqual(post1.id, post2.reshared_from.id)
        self.assertEqual(post1.id, post3.reshared_from.id)

    def test_can_act_on_others_public_post(self):
        # Create users
        self.assertTrue(User.create('user1', '1234'))
        self.assertTrue(User.create('user2', '2345'))
        self.assertTrue(User.create('user3', '3456'))
        user1 = User.find('user1')
        user2 = User.find('user2')
        user3 = User.find('user3')

        # Create reshareable public post1 from user1
        post1_id = user1.create_post('post1', True, [], True, None, [])
        post1 = user1.get_post(post1_id)

        # Create non-reshareable public post2 from user1
        post2_id = user1.create_post('post2', True, [], False, None, [])
        post2 = user1.get_post(post2_id)

        # user2 follows user1
        user2.add_following(user1)

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
        self.assertTrue(User.create('user1', '1234'))
        user1 = User.find('user1')

        # Create circle1
        self.assertTrue(user1.create_circle('circle1'))
        circle1 = user1.find_circle('circle1')

        # Create post1 into circle1
        user1.create_post('post1', False, [circle1], True, None, [])
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

        # Create reshareable post1 by user1 into circle1
        post1_id = user1.create_post('post1', False, [circle1], True, None, [])
        post1 = user1.get_post(post1_id)

        # Create non-reshareable post2 by user1 into circle1
        post2_id = user1.create_post('post2', False, [circle1], False, None, [])
        post2 = user1.get_post(post2_id)

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
        user1.create_post('post1', False, [circle1], False, None, [])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # Create public post2 by user1
        user1.create_post('post2', True, [], False, None, [])
        post2 = Post.objects(content='post2')
        self.assertTrue(1, len(post2))
        post2 = post2[0]

        # User1 sees post2 and post1 on home and user1's profile
        self.assertEqual([post2, post1], user1.retrieves_posts_on_home())
        self.assertEqual([post2, post1], user1.retrieves_posts_on_profile(user1))

        # User2 sees post2 and post1 on home and user1's profile
        self.assertEqual([post2, post1], user2.retrieves_posts_on_home())
        self.assertEqual([post2, post1], user2.retrieves_posts_on_profile(user1))

        # User3 sees nothing on home and post2 and post1 on user1's profile
        self.assertEqual([], user3.retrieves_posts_on_home())
        self.assertEqual([post2, post1], user3.retrieves_posts_on_profile(user1))

        # User4 sees nothing on home and post2 on user1's profile
        self.assertEqual([], user4.retrieves_posts_on_home())
        self.assertEqual([post2], user4.retrieves_posts_on_profile(user1))

    ############
    # Reaction #
    ############
    def test_react_twice(self):
        # Create users
        self.assertTrue(User.create('user1', '1234'))
        user1 = User.find('user1')

        # Create post
        user1.create_post('post1', True, [], False, None, [])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        def op():
            user1.create_reaction('💩', post1)
            post11 = Post.objects(author=user1)
            self.assertTrue(1, len(post11))
            post11 = post11[0]
            user1.create_reaction('💩', post11)

        self.assertRaises(UnauthorizedAccess, op)

    def test_delete_reaction(self):
        # Create users
        self.assertTrue(User.create('user1', '1234'))
        self.assertTrue(User.create('user2', '1234'))
        user1 = User.find('user1')
        user2 = User.find('user2')

        # Create post
        user1.create_post('post1', True, [], False, None, [])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # User2 creates reaction
        user2.create_reaction('💩', post1)
        reaction1 = Reaction.objects(author=user2)
        self.assertTrue(1, len(reaction1))
        reaction1 = reaction1[0]

        # User2 creates reaction and user1 tries to delete it
        def op():
            user1.delete_reaction(reaction1, post1)

        self.assertRaises(UnauthorizedAccess, op)

        # User2 deletes his own reaction
        user2.delete_reaction(reaction1, post1)

        # User2 tries to delete a reaction that doesn't exit
        def op2():
            user2.delete_reaction(reaction1, post1)

        self.assertRaises(NotFound, op2)

    def test_add_bad_reaction(self):
        # Create users
        self.assertTrue(User.create('user1', '1234'))
        user1 = User.find('user1')

        # Create post
        user1.create_post('post1', True, [], False, None, [])
        post1 = Post.objects(author=user1)
        self.assertTrue(1, len(post1))
        post1 = post1[0]

        # User1 tries to add more than one emoji
        def op():
            user1.create_reaction('💩💩', post1)

        self.assertRaises(BadRequest, op)

        # User1 tries to add something that is not emoji
        def op2():
            user1.create_reaction('r', post1)

        self.assertRaises(BadRequest, op2)

        # todo: this is a bug
        # User1 tries to add something that is not emoji
        # def op3():
        #     user1.create_reaction('r💩rrr', post1)

        # self.assertRaises(BadRequest, op3)
