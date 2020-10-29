#!/usr/bin/env python
import unittest
import json
import warnings

from app import create_app, db
from app.models import User, Token
from app.config import Config

create_user1 = {
    "username": "user1111",
    "password": "password123",
    "email": "teste1@teste.com",
    "name": "Teste1"
}

login_user1 = {
    "username": "user1111",
    "password": "password123"
}

create_user2 = {
    "username": "user2222",
    "password": "password123",
    "email": "teste2@teste.com",
    "name": "Teste2"
}

login_user2 = {
    "username": "user2222",
    "password": "password123"
}


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite://'


class UserModelCase(unittest.TestCase):
    def setUp(self):
        warnings.simplefilter('ignore', (DeprecationWarning, UserWarning, ImportWarning))
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
        user = User(**create_user1)
        db.session.add(user)
        db.session.commit()
        self.assertTrue(user.username == create_user1['username'])

    # Test route
    def test_create_user_route(self):
        """
            1 - Create an user
        """
        with self.app.test_client() as c:
            response = c.post("/api/users", json=create_user1)
            self.assertEqual(response.status_code, 201)

    def test_revoke_all_tokens(self):
        """
            1 - Create user create_user1
            2 - Login create_user1
            3 - Revoke all tokens of create_user1
        """
        with self.app.test_client() as c:
            response = c.post("/api/users", json=create_user1)
            self.assertEqual(response.status_code, 201)
            data = json.loads(response.get_data(as_text=True))
            user_id = data["id"]
            response = c.post("/api/auth/login", json=login_user1)
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.get_data(as_text=True))
            c.environ_base["HTTP_AUTHORIZATION"] = "Bearer " + \
                                                   data["access_token"]

            response = c.delete("/api/auth/revoke-all-tokens")
            user = User.query.get(user_id)
            tokens = user.tokens.filter(Token.revoked == 0).all()
            self.assertEqual(len(tokens), 0)

    def test_edit_user(self):
        """
            1 - Create user create_user1 and login
            2 - Create user create_user2
            3 - Verify if create_user1 can edit create_user2
            4 - Verify if create_user1 can edit create_user1
        """
        with self.app.test_client() as c:
            # 1 - Create
            response = c.post("/api/users", json=create_user1)
            self.assertEqual(response.status_code, 201)
            data = json.loads(response.get_data(as_text=True))
            username1 = data["username"]

            # 1 - Login
            response = c.post("/api/auth/login", json=login_user1)
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.get_data(as_text=True))
            c.environ_base["HTTP_AUTHORIZATION"] = "Bearer " + \
                                                   data["access_token"]

            # 2 - Create create_user2
            response = c.post("/api/users", json=create_user2)
            self.assertEqual(response.status_code, 201)
            data = json.loads(response.get_data(as_text=True))
            username2 = data["username"]

            # 3 - Verify if create_user1 can edit create_user2
            response = c.put("api/users/" + str(username2),
                             json={"email": "newemail@ll.com"})
            user = User.get_by_username(username2)
            self.assertNotEqual(user.email, "newemail@ll.com")

            # 3 - Verify if create_user1 can edit create_user1
            response = c.put("api/users/" + str(username1),
                             json={"email": "newemail@ll.com"})
            user = User.get_by_username(username1)
            self.assertEqual(user.email, "newemail@ll.com")


if __name__ == '__main__':
    unittest.main()
