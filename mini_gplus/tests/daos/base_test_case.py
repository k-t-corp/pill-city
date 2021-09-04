from unittest import TestCase
from mongoengine import connect, disconnect


class BaseTestCase(TestCase):
    def setUp(self):
        self.connection = connect('mongoenginetest', host='mongomock://localhost')

    def tearDown(self):
        self.connection.drop_database("mongoenginetest")
        disconnect()
