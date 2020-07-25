#!/usr/bin/env python
import unittest
from app import create_app, db
from app.models import User, Post
from config import Config


user1 = {
    "username": "user1",
    "password": "password123",
    "email": "teste@teste.com",
    "name": "Teste1"
}

post1 = {
    "data_uuid": "uuid1"
}


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite://'


class UserModelCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_new_post(self):
        user = User(**user1)
        post = Post(**post1, author=user)
        db.session.add(user)
        db.session.add(post)
        db.session.commit()
        self.assertTrue(user.posts[0].data_uuid == post1['data_uuid'])
        self.assertTrue(post.author == user)


if __name__ == '__main__':
    unittest.main(verbosity=2)
