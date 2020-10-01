#!/usr/bin/env python
import unittest
from app import create_app, db
from app.models import User
from config import Config


user1 = {
    "username": "user11123",
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

    # Test functions
    def test_new_user(self):
        user = User(**user1)
        db.session.add(user)
        db.session.commit()
        self.assertTrue(user.username == user1['username'])

    # Test routes
    def test_create_user_route(self):
        """
            1 - Create an user
        """
        with self.app.test_client() as c:
            response = c.post("/api/users", json=user1)
            self.assertEqual(response.status_code, 200)


if __name__ == '__main__':
    unittest.main(verbosity=2)
