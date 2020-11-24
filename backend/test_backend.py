#!/usr/bin/env python
import unittest
import warnings
import json
from werkzeug.datastructures import FileStorage

from app import create_app, db
from app.config import Config
from app.models import User, Token, Notification, Post
from aiuna.step.dataset import Dataset
from app.api.tasks import process_data
from app.api.posts import save_files


create_user1 = {
    "username": "user1111",
    "password": "password123",
    "email": "teste1@teste.com",
    "name": "Teste1"
}

create_user2 = {
    "username": "user2222",
    "password": "password123",
    "email": "teste2@teste.com",
    "name": "Teste2"
}

create_user3 = {
    "username": "user3333",
    "password": "password123",
    "email": "teste3@teste.com",
    "name": "Teste3"
}


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite://'
    BROKER_URL = 'redis://'
    CELERY_RESULT_BACKEND = None
    TATU_URL = 'sqlite://:memory:'


class ApiCase(unittest.TestCase):
    def setUp(self):
        warnings.simplefilter(
            'ignore', (DeprecationWarning, UserWarning, ImportWarning))
        self.app = create_app(TestConfig)
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.app.test_client()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def login(self, create_user=True, user=create_user1, long_term=False, admin=False):
        # 1 - Create
        if create_user:
            response = self.client.post("/api/users", json=user)
            self.assertEqual(response.status_code, 201)
            data = response.json

        # 1 - Login
        login = user.copy()
        del login["email"]
        del login["name"]
        response = self.client.post("/api/auth/login", json=login)
        self.assertEqual(response.status_code, 200)
        data = response.json
        self.client.environ_base["HTTP_AUTHORIZATION"] = "Bearer " + \
            data["access_token"]

        if admin:
            user = User.query.get(data['id'])
            user.role = 10
            db.session.commit()

        if long_term:
            response = self.client.post("/api/auth/create-api-token")
            self.assertEqual(response.status_code, 201)
            data_api = response.json
            self.client.environ_base["HTTP_AUTHORIZATION"] = "Bearer " + \
                data_api["api_token"]

        return data

    # Test db
    def test_db(self):
        """
            1 - Create an user
            2 - Check if exists
        """
        user = User(**create_user1)
        db.session.add(user)
        db.session.commit()
        self.assertTrue(user.username == create_user1['username'])

    def test_login(self):
        """
            1 - Create an user
            2 - Login user
        """
        self.login()

    def test_create_api_token(self):
        """
            1 - Create an user/Login
            2 - Login user using API token
        """
        self.login(long_term=True)

    def test_logout(self):
        """
            1 - Create an user/Login
            2 - Logout
        """
        self.login()
        response = self.client.delete("/api/auth/logout")
        self.assertEqual(response.status_code, 200)

    def test_revoke_all_tokens(self):
        """
            1 - Login user
            2 - Revoke all tokens of user
        """

        user_dict = self.login()
        response = self.client.delete("/api/auth/revoke-all-tokens")
        self.assertEqual(response.status_code, 200)
        user = User.query.get(user_dict['id'])
        tokens = user.tokens.filter(Token.revoked == 0).count()
        self.assertEqual(tokens, 0)

    def test_comments(self):
        """
            1 - Login
            2 - Create a new post
            3 - Insert a comment into the post
            4 - Get the comment info
            5 - Insert a reply into the post
            6 - Get the reply info
        """
        # 1
        self.login()
        # 2
        arff = Dataset().data.arff("rel", "desc")
        filename = "/dev/shm/iris.arff"
        with open(filename, 'w') as fw:
            fw.write(arff)
        fr = open(filename, 'rb')
        self.client.post(
            "/api/posts", data={'files': (fr, "test.arff")})
        # needs run celery

    def test_contacts(self):
        """
            1 - Send contact form
            2 - Login with normal user
            3 - Try to get contact info
            4 - Login with admin
            5 - Get contact info
        """
        response = self.client.post(
            "/api/contacts", json={"name": "Test", "email": "test@test.com"})
        self.assertEqual(response.status_code, 201)
        self.login()
        response = self.client.get("/api/contacts")
        self.assertEqual(response.status_code, 422)
        self.login(admin=True, create_user=False)
        response = self.client.get("/api/contacts")
        data = response.json
        self.assertEqual(len(data), 1)
        response = self.client.get(f"/api/contacts/{data[0]['id']}")
        self.assertEqual(response.status_code, 200)

    def test_downloads(self):
        """
            1 - Login
            2 - Create a new post
            3 - Download dataset from post
        """
        # needs run celery

    def test_messages(self):
        """
            1 - Login user1
            2 - Try to send message to yourself
            3 - Login user2
            4 - Send message to user1
            5 - User2 can list the message
            6 - Login user1
            7 - User1 can list the message
            8 - Login user3
            9 - User3 can not list the message
        """
        # 1
        username1 = self.login()['username']
        # 2
        response = self.client.post(
            f"/api/messages/{username1}", json={'body': "Message test"})
        self.assertEqual(response.status_code, 422)
        # 3
        username2 = self.login(user=create_user2)['username']
        # 4
        response = self.client.post(
            f"/api/messages/{username1}", json={'body': "Message test"})
        self.assertEqual(response.status_code, 200)
        messageid = response.json['id']
        # 5
        response = self.client.get(f"/api/messages/{messageid}")
        self.assertEqual(response.status_code, 200)
        response = self.client.get(f"/messages/{username1}/conversation")
        self.assertEqual(len(response.json), 1)
        response = self.client.get(f"/messages/{username1}/lasts")
        self.assertEqual(len(response.json), 1)
        # 6
        self.login(create_user=False)
        # 7
        response = self.client.get(f"/api/messages/{username2}")
        self.assertEqual(len(response.json), 1)
        response = self.client.get(f"/api/messages/{messageid}")
        self.assertEqual(response.status_code, 200)
        response = self.client.get(f"/messages/{username2}/conversation")
        self.assertEqual(len(response.json), 1)
        response = self.client.get(f"/messages/{username1}/lasts")
        self.assertEqual(len(response.json), 1)
        # 8
        self.login(user=create_user3)['username']
        # 9
        response = self.client.get(f"/api/messages/{messageid}")
        self.assertNotEqual(response.status_code, 200)

    def test_notifications(self):
        """
            1 - Login user1
            2 - Create a new notification
            3 - List the notification
            4 - Read the notifications
        """
        # 1
        username = self.login()['username']
        # 2
        user = User.get_by_username(username)
        user.add_notification('unread_notification_count', 10)
        # 3
        response = self.client.get("/api/notifications")
        self.assertEqual(len(response.json), 1)
        # 4
        response = self.client.put("/api/notifications/read")
        self.assertEqual(response.status_code, 201)
        nc = Notification.query.filter_by(
            name="unread_notification_count").first()
        self.assertEqual(json.loads(nc.payload_json), 0)

    def test_posts(self):
        """
            1 - Login
            2 - Create a new post uploading a dataset
            3 - Run celery task to create the post
            4 - List the post
        """
        # 1
        username = self.login()['username']
        # 2
        arff = Dataset().data.arff("rel", "desc")
        filename = "/tmp/iris.arff"
        with open(filename, 'w') as fw:
            fw.write(arff)
        with open(filename, 'rb') as fr:
            response = self.client.post(
                "/api/posts", data={'files': (fr, "test.arff")})
        self.assertEqual(response.status_code, 200)
        # 3
        with open(filename, 'rb') as fr:
            filestorage = FileStorage(
                fr, filename="iris_send.arff", content_type="application/octet-stream")
            files = save_files([filestorage])
        result = process_data.run(files, username)
        # 4
        self.assertEqual(result['state'], 'SUCCESS')
        self.assertEqual(len(Post.query.all()), 1)

    def test_tasks(self):
        """
            1 - Start a new task
            2 - Check the status
        """
        # needs run celery

    def test_create_user(self):
        """
            1 - Create user
            2 - List user
        """
        # 1
        username = self.login()['username']
        # 2
        response = self.client.get("/api/users")
        self.assertEqual(len(response.json), 1)
        response = self.client.get(f"/api/users/{username}")
        self.assertEqual(response.status_code, 200)

    def test_delete_user(self):
        """
            1 - Create user2
            2 - Login user1
            3 - User1 can not delete user2
            4 - User1 can delete himself
            5 - Login admin
            6 - Admin can delete user2
        """
        # 1
        username2 = self.login(user=create_user2)['username']
        # 2
        username1 = self.login()['username']
        # 3
        response = self.client.delete(f"/api/users/{username2}")
        self.assertEqual(response.status_code, 422)
        # 4
        response = self.client.delete(f"/api/users/{username1}")
        self.assertEqual(response.status_code, 200)
        # 5
        self.login(user=create_user3, admin=True)['username']
        # 6
        response = self.client.delete(f"/api/users/{username2}")
        self.assertEqual(response.status_code, 200)

    def test_edit_user(self):
        """
            1 - Create user2
            2 - Create user1 and login with user1
            3 - Verify if user1 can edit user2
            4 - Verify if user1 can edit user1
        """
        # 1
        username2 = self.login(user=create_user2)['username']
        # 2
        username1 = self.login()['username']
        # 3
        response = self.client.put("api/users/" + str(username2),
                                   json={"email": "newemail@ll.com"})
        self.assertNotEqual(response.status_code, 200)
        user = User.get_by_username(username2)
        self.assertNotEqual(user.email, "newemail@ll.com")
        # 4
        response = self.client.put("api/users/" + str(username1),
                                   json={"email": "newemail@ll.com"})
        self.assertEqual(response.status_code, 200)
        user = User.get_by_username(username1)
        self.assertEqual(user.email, "newemail@ll.com")

    def test_follow_user(self):
        """
            1 - Create user2
            2 - Create user1 and login with user1
            3 - User1 can not follow himself
            4 - Follow user2
            5 - Check user1 and user2 followers
            6 - Unfollow
            7 - Check user1 and user2 followers
        """
        # 1
        username2 = self.login(user=create_user2)['username']
        # 2
        username1 = self.login()['username']
        # 3
        response = self.client.post(f"api/users/{username2}/follow")
        self.assertEqual(response.status_code, 200)
        # 4
        response = self.client.post(f"api/users/{username1}/follow")
        self.assertNotEqual(response.status_code, 200)
        # 5
        user1 = User.get_by_username(username1)
        user2 = User.get_by_username(username2)
        self.assertEqual(len(user2.followers.all()), 1)
        self.assertEqual(len(user1.followers.all()), 0)
        self.assertEqual(len(user1.followed.all()), 1)
        self.assertEqual(len(user2.followed.all()), 0)
        # 6
        response = self.client.post(f"api/users/{username2}/follow")
        self.assertEqual(response.status_code, 200)
        # 7
        self.assertEqual(len(user2.followers.all()), 0)
        self.assertEqual(len(user1.followers.all()), 0)
        self.assertEqual(len(user1.followed.all()), 0)
        self.assertEqual(len(user2.followed.all()), 0)


if __name__ == '__main__':
    unittest.main()
