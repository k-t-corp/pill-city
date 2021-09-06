from unittest import TestCase
from mongoengine import connect, disconnect
from mini_gplus.daos.user_cache import populate_user_cache, reset_user_cache


class BaseTestCase(TestCase):
    def setUp(self):
        self.connection = connect('mongoenginetest', host='mongomock://localhost')
        populate_user_cache()

    def tearDown(self):
        reset_user_cache()
        self.connection.drop_database("mongoenginetest")
        disconnect()
