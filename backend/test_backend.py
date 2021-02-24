import json
import unittest
import warnings
from datetime import timedelta
from io import BytesIO
from unittest.mock import patch

from aiuna.compression import pack
from aiuna.step.dataset import Dataset
from aiuna.step.let import Let
from time import sleep
# import os
from werkzeug.datastructures import FileStorage

import app
from app import create_app, db
from app.api.posts import save_files
from app.api.tasks import process_file, download_data, run_step
from app.config import Config
from app.models import User, Token, Notification, Post
from app.utils import consts

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
    # TATU_URL = 'sqlite://testdb'
    TATU_URL = 'sqlite://:memory:'


class ApiCase(unittest.TestCase):
    def setUp(self):
        warnings.simplefilter(
            'ignore', (DeprecationWarning, UserWarning, ImportWarning))  # checar se SAWarning do SQLAlchemy é relevante
        app.RECONNECTMODE_TATU = False
        app.DEBUG_TATU = True
        self.app = create_app(TestConfig)
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.app.test_client()
        db.create_all()
        self.tatu = self.app.config['TATU_SERVER']()
        # if os.path.exists('testdb.db'):
        #     os.remove('testdb.db')

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        self.tatu.close(force=True)

    def login(self, create_user=True, user=create_user1, long_term=False, admin=False, token=None, confirm_email=True):
        # 1 - Create
        if create_user:
            response = self.client.post("/api/users", json=user)
            self.assertEqual(response.status_code, 201)
            data = response.json

        # 2 - Confirm email
        if confirm_email:
            u = User.get_by_username(user['username'])
            u.email_confirmed = True
            db.session.commit()

        # 3 - Login
        login = user.copy()
        del login["email"]
        del login["name"]
        response = self.client.post("/api/auth/login", json=login)
        if not response.status_code == 200:
            return response.json
        data = response.json
        token = token if token else data["access_token"]
        self.client.environ_base["HTTP_AUTHORIZATION"] = "Bearer " + token

        if admin:
            u = User.get_by_username(user['username'])
            u.role = consts.get("ROLE_ADMIN")
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
        u = User.query.get(1)
        self.assertTrue(u.username == create_user1['username'])

    def test_rollback(self):
        user = User(**create_user1)
        db.session.add(user)
        db.session.rollback()
        u = User.query.get(1)
        self.assertTrue(u is None)

    def test_main(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)

    def test_notfound(self):
        response = self.client.get("/nothing")
        self.assertEqual(response.status_code, 404)

    def test_auth(self):
        """
            1 - Login
            2 - Revoke token
            3 - Try to access feed route
            4 - Generate invalid token and try to access feed route
            5 - Create an expired token and try to access feed route
        """
        # 1
        username = self.login()['username']
        user = User.get_by_username(username)
        # 2
        user.revoke_all_tokens()
        # 3
        response = self.client.get(f"/api/users/{username}/feed")
        self.assertEqual(response.status_code, 401)
        # 4
        username2 = self.login(user=create_user2, token="inexistenttoken")[
            'username']
        response = self.client.get(f"/api/users/{username2}/feed")
        self.assertEqual(response.status_code, 401)
        # 5
        self.app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(
            microseconds=10)
        username = self.login(user=create_user3)['username']
        sleep(1)
        response = self.client.get(f"/api/users/{username}/feed")
        self.assertEqual(response.status_code, 401)

    def test_login(self):
        """
            1 - Try to login without confirming email
            2 - Confirm email and access feed
        """
        # 1
        response = self.login(confirm_email=False)
        self.assertEqual(response["code"], 422)
        # 2
        username = self.login(create_user=False, confirm_email=True)[
            'username']
        response = self.client.get(f"/api/users/{username}/feed")
        self.assertEqual(response.status_code, 200)

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

    def test_contacts(self):
        """
            1 - Send contact form
            2 - Login with admin
            3 - Get contact info
            4 - Try to get inexistent contact
            5 - Login with normal user
            6 - Try to get contact info
        """
        # 1
        with patch('app.api.tasks.send_async_email.delay'):
            response = self.client.post(
                "/api/contacts", json={"name": "Test", "email": "test@test.com", "message": "Ola"})
        self.assertEqual(response.status_code, 201)
        # 2
        self.login(admin=True)
        # 3
        response = self.client.get("/api/contacts")
        data = response.json
        self.assertEqual(len(data), 1)
        response = self.client.get(f"/api/contacts/{data[0]['id']}")
        self.assertEqual(response.status_code, 200)
        # 4
        response = self.client.get("/api/contacts/100")
        self.assertEqual(response.status_code, 422)
        # 5
        self.login(user=create_user2)
        # 6
        response = self.client.get("/api/contacts")
        self.assertEqual(response.status_code, 422)
        response = self.client.get(f"/api/contacts/{data[0]['id']}")
        self.assertEqual(response.status_code, 422)

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
            10 - Can not send a message to an inexistent user
            11 - Can not list a message of an inexistent user
            12 - Can not list conversation with an inexistent user
            13 - Can not list last messages of an inexistent user
            14 - Can not list last messages of another user
            15 - Can not list an inexistent message id
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
        response = self.client.get(f"api/messages/{username1}/conversation")
        self.assertEqual(len(response.json), 1)
        response = self.client.get(f"api/messages/{username2}/lasts")
        self.assertEqual(len(response.json), 1)
        # 6
        self.login(create_user=False)
        # 7
        response = self.client.get(f"/api/messages/{username2}")
        self.assertEqual(len(response.json), 1)
        response = self.client.get(f"/api/messages/{messageid}")
        self.assertEqual(response.status_code, 200)
        response = self.client.get(f"api/messages/{username2}/conversation")
        self.assertEqual(len(response.json), 1)
        response = self.client.get(f"api/messages/{username1}/lasts")
        self.assertEqual(len(response.json), 1)
        # 8
        self.login(user=create_user3)['username']
        # 9
        response = self.client.get(f"/api/messages/{messageid}")
        self.assertNotEqual(response.status_code, 200)
        # 10
        response = self.client.post(
            "/api/messages/inexistent", json={'body': "Message test"})
        self.assertNotEqual(response.status_code, 200)
        # 11
        response = self.client.get("/api/messages/inexistent")
        self.assertNotEqual(response.status_code, 200)
        # 12
        response = self.client.get("/api/messages/inexistent/conversation")
        self.assertNotEqual(response.status_code, 200)
        # 13
        response = self.client.get(f"/api/messages/{username2}/lasts")
        self.assertNotEqual(response.status_code, 200)
        # 14
        response = self.client.get("/api/messages/inexistent/lasts")
        self.assertNotEqual(response.status_code, 200)
        # 15
        response = self.client.get("/api/messages/100")
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
            1 - Create user2 and create/login with user1
            2 - Create a new post uploading a dataset
            3 - Run celery task to create the post
            4 - Edit post's description and name
            5 - List the post
            6 - Download the dataset
            7 - Favorite/Unfavorite post
            8 - Publish post
            9 - Feed
            10 - Comment post
            11 - Reply to comment
            12 - Add user2 as collaborator, check, remove and check again
            13 - Get visualize data
            14 - Users can not upload same dataset twice
            15 - Check twins of post. Add user2 as collaborator. Check twins again
            16 - Run step
            17 - Delete post
        """
        # 1
        username2 = self.login(user=create_user2)['username']
        username = self.login()['username']
        user = User.get_by_username(username)
        user2 = User.get_by_username(username2)
        # 2
        arff = Dataset().data.arff("rel", "desc")
        filename = "/tmp/iris.arff"
        with open(filename, 'w') as fw:
            fw.write(arff)
        with open(filename, 'rb') as fr:
            with patch('app.api.tasks.User.launch_task'):
                response = self.client.post(
                    "/api/posts", data={'files': (fr, "test.arff")})

        self.assertEqual(response.status_code, 200)
        # 3
        with open(filename, 'rb') as fr:
            filestorage = FileStorage(
                fr, filename="iris_send.arff", content_type="application/octet-stream")
            files = save_files([filestorage])
        result = process_file.run(files, username)
        self.assertEqual(json.loads(result['result'])[
                         0]["code"] == "success", True)
        post_id = json.loads(result['result'])[0]['id']
        post = Post.query.get(post_id)
        # 4
        new_name = "new name"
        new_description = "new description"
        # User2 can not edit post
        self.login(create_user=False, user=create_user2)
        response = self.client.put(
            f"/api/posts/{post_id}", json={"name": new_name, "description": new_description})
        self.assertEqual(response.status_code, 422)
        # Public post can not be edited
        self.login(create_user=False)
        post.public = True
        db.session.commit()
        response = self.client.put(
            f"/api/posts/{post_id}", json={"name": new_name, "description": new_description})
        self.assertEqual(response.status_code, 422)
        post.public = False
        db.session.commit()
        # Edit post
        response = self.client.put(
            f"/api/posts/{post_id}", json={"name": new_name, "description": new_description})
        self.assertEqual(response.status_code, 200)
        # Can not edit inexistent post
        response = self.client.put(
            "/api/posts/100", json={"name": new_name, "description": new_description})
        self.assertEqual(response.status_code, 422)
        # 5
        # User2 can not list the post
        self.login(create_user=False, user=create_user2)
        response = self.client.get(f"/api/posts/{post_id}")
        self.assertEqual(response.status_code, 422)
        # List post
        self.login(create_user=False)
        response = self.client.get(f"/api/posts/{post_id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['name'], new_name)
        self.assertEqual(response.json['description'], new_description)
        response = self.client.get("/api/posts/100")
        self.assertEqual(response.status_code, 422)
        # List all posts
        response = self.client.get("/api/posts")
        self.assertEqual(len(response.json), 1)
        self.assertEqual(response.status_code, 200)
        # 6
        with patch('app.api.tasks.User.launch_task'):
            response = self.client.post(f"/api/downloads/data?pids={post_id}")
        self.assertEqual(response.status_code, 200)
        result = download_data.run([post_id], username, "127.0.0.1")
        self.assertEqual(result['state'], 'SUCCESS')
        # Can not download inexistent file
        response = self.client.get("/api/downloads/data?name=inexistent")
        self.assertEqual(response.status_code, 422)
        # User2 does not have access to file
        self.login(create_user=False, user=create_user2)
        response = self.client.get(
            f"/api/downloads/data?name={json.loads(result['result'])}")
        self.assertEqual(response.status_code, 422)
        # User1 can download file
        self.login(create_user=False)
        response = self.client.get(
            f"/api/downloads/data?name={json.loads(result['result'])}")
        self.assertEqual(response.status_code, 200)
        # Check downloads count
        self.assertEqual(post.get_unique_download_count(), 1)
        result = download_data.run([post_id], username, "127.0.0.1")
        self.assertEqual(result['state'], 'SUCCESS')
        self.assertEqual(post.get_unique_download_count(), 1)
        result = download_data.run([post_id], username, "127.0.0.2")
        self.assertEqual(result['state'], 'SUCCESS')
        self.assertEqual(post.get_unique_download_count(), 2)
        # 7
        response = self.client.post(f"/api/posts/{post_id}/favorite")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(user.has_favorited(post), True)
        response = self.client.post(f"/api/posts/{post_id}/favorite")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(user.has_favorited(post), False)
        # Can not favorite an inexistent post
        response = self.client.post("/api/posts/100/favorite")
        self.assertEqual(response.status_code, 422)
        # User2 can not favorite post
        self.login(create_user=False, user=create_user2)
        response = self.client.post(f"/api/posts/{post_id}/favorite")
        self.assertEqual(response.status_code, 422)
        self.login(create_user=False)
        # 8
        # Can not publish inexistent post
        response = self.client.post("/api/posts/100/publish")
        self.assertEqual(response.status_code, 422)
        # User2 can not publish the post
        self.login(create_user=False, user=create_user2)
        response = self.client.post(f"/api/posts/{post_id}/publish")
        self.assertEqual(response.status_code, 422)
        self.login(create_user=False)
        # Can not publish without set meta
        self.assertEqual(post.public, False)
        response = self.client.post(f"/api/posts/{post_id}/publish")
        self.assertEqual(response.status_code, 422)
        self.assertEqual(post.public, False)
        # Publish
        post.classification = True
        post.regression = True
        post.clustering = True
        self.assertEqual(post.public, False)
        response = self.client.post(f"/api/posts/{post_id}/publish")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(post.public, True)
        # Can not publish twice
        response = self.client.post(f"/api/posts/{post_id}/publish")
        self.assertEqual(response.status_code, 422)
        # User2 has access to post since it is public
        self.login(create_user=False, user=create_user2)
        response = self.client.get(f"/api/posts/{post_id}")
        self.assertEqual(response.status_code, 200)
        post.public = False
        db.session.commit()
        self.login(create_user=False)
        # 9
        # User can not see user2's feed
        response = self.client.get(f"/api/users/{username2}/feed")
        self.assertEqual(response.status_code, 422)
        # Post should appear on user's feed and not on user2's feed
        response = self.client.get(f"/api/users/{username}/feed")
        self.assertEqual(len(response.json), 1)
        self.login(create_user=False, user=create_user2)
        response = self.client.get(f"/api/users/{username2}/feed")
        self.assertEqual(len(response.json), 0)
        # Public post should appear on user2's feed if user2 is following user
        post.public = True
        db.session.commit()
        response = self.client.get(f"/api/users/{username2}/feed")
        self.assertEqual(len(response.json), 0)
        user2.follow(user)
        db.session.commit()
        response = self.client.get(f"/api/users/{username2}/feed")
        self.assertEqual(len(response.json), 1)
        post.public = False
        user2.unfollow(user)
        db.session.commit()
        self.login(create_user=False)
        # 10
        # Can not comment an inexistent post
        response = self.client.post(
            "/api/posts/100/comments", json={"text": "Comment 1"})
        self.assertEqual(response.status_code, 422)
        # Comment
        response = self.client.post(
            f"/api/posts/{post_id}/comments", json={"text": "Comment 1"})
        self.assertEqual(response.status_code, 200)
        # User2 can not comment
        self.login(create_user=False, user=create_user2)
        response = self.client.post(
            f"/api/posts/{post_id}/comments", json={"text": "Comment 1"})
        self.assertEqual(response.status_code, 422)
        # User2 can not list comments
        response = self.client.get(f"/api/posts/{post_id}/comments")
        self.assertEqual(response.status_code, 422)
        self.login(create_user=False)
        # List comments
        response = self.client.get(f"/api/posts/{post_id}/comments")
        self.assertEqual(len(response.json), 1)
        comment_id = response.json[0]['id']
        # Can not list inexistent post comments
        response = self.client.get("/api/posts/100/comments")
        self.assertEqual(response.status_code, 422)
        # 11
        response = self.client.post(
            f"/api/comments/{comment_id}/replies", json={"text": "Reply to comment 1"})
        self.assertEqual(response.status_code, 200)
        response = self.client.post(
            "/api/comments/100/replies", json={"text": "Reply to comment 1"})
        self.assertEqual(response.status_code, 422)
        response = self.client.get(f"/api/comments/{comment_id}/replies")
        self.assertEqual(len(response.json), 1)
        response = self.client.get("/api/comments/100/replies")
        self.assertEqual(response.status_code, 422)
        # 12
        # Can not invite himself
        response = self.client.post(
            f"/api/posts/{post_id}/collaborators", json={"username": username})
        self.assertEqual(response.status_code, 422)
        self.assertEqual(User.get_by_username(
            username2).has_access(post), False)
        # Invite user2
        response = self.client.post(
            f"/api/posts/{post_id}/collaborators", json={"username": username2})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.get_by_username(
            username2).has_access(post), True)
        # Can not invite user2 to an inexistent post
        response = self.client.post(
            "/api/posts/100/collaborators", json={"username": username2})
        self.assertEqual(response.status_code, 422)
        # Can not invite an inexistent user
        response = self.client.post(
            f"/api/posts/{post_id}/collaborators", json={"username": "inexistent"})
        self.assertEqual(response.status_code, 422)
        # User2 can not invite collaborators
        self.login(create_user=False, user=create_user2)
        response = self.client.post(
            f"/api/posts/{post_id}/collaborators", json={"username": username2})
        self.assertEqual(response.status_code, 422)
        self.login(create_user=False)
        # Remove collaborator
        response = self.client.post(
            f"/api/posts/{post_id}/collaborators", json={"username": username2})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.get_by_username(
            username2).has_access(post), False)
        # 13
        # Can not get visualize of inexistent post
        response = self.client.get("/api/posts/100/visualize?plt=scatter")
        self.assertEqual(response.status_code, 422)
        response = self.client.get(
            f"/api/posts/{post_id}/visualize?plt=scatter")
        self.assertEqual(response.status_code, 200)
        response = self.client.get(
            f"/api/posts/{post_id}/visualize?plt=parallelcoordinates")
        self.assertEqual(response.status_code, 200)
        response = self.client.get(
            f"/api/posts/{post_id}/visualize?plt=pearsoncorrelation")
        self.assertEqual(response.status_code, 200)
        response = self.client.get(
            f"/api/posts/{post_id}/visualize?plt=histogram")
        self.assertEqual(response.status_code, 200)
        # User2 can not access visualization data
        self.login(create_user=False, user=create_user2)
        response = self.client.get(
            f"/api/posts/{post_id}/visualize?plt=histogram")
        self.assertEqual(response.status_code, 422)
        self.login(create_user=False)
        # 14
        result = process_file.run(files, username2)
        self.assertEqual(result['state'], 'SUCCESS')
        self.assertEqual(json.loads(result['result'])[
                         0]["code"] == "error", False)
        result = process_file.run(files, username2)
        self.assertEqual(result['state'], 'SUCCESS')
        self.assertEqual(json.loads(result['result'])[
                         0]["code"] == "error", True)
        # 15
        # Can not list twins of inexistent post
        response = self.client.get("/api/posts/100/twins")
        self.assertEqual(response.status_code, 422)
        # List twins
        response = self.client.get(f"/api/posts/{post_id}/twins")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 0)
        response = self.client.post(
            f"/api/posts/{post_id}/collaborators", json={"username": username2})
        self.login(create_user=False, user=create_user2)
        response = self.client.get(f"/api/posts/{post_id}/twins")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 1)
        # 16
        step = {
            "category": "evaluation",
            "algorithm": "partition",
            "parameters": {'mode': 'cv', 'splits': 10, 'seed': 0, 'fields': 'X,Y'}
        }

        step_full = {
            'id': post.data_uuid,
            'desc': {
                'name': 'Partition',
                'path': 'kururu.tool.evaluation.partition',
                'config': {'mode': 'cv', 'splits': 10, 'seed': 0, 'fields': 'X,Y'}
            }
        }

        # Can not run step on inexistent post
        with patch('app.api.tasks.User.launch_task'):
            response = self.client.post(
                "/api/posts/100/run", json=step)
        self.assertEqual(response.status_code, 422)
        # User3 can not run
        self.login(user=create_user3)
        with patch('app.api.tasks.User.launch_task'):
            response = self.client.post(
                f"/api/posts/{post_id}/run", json=step)
        self.assertEqual(response.status_code, 422)
        self.login(create_user=False, user=create_user2)
        # Run task
        with patch('app.api.tasks.User.launch_task'):
            response = self.client.post(
                f"/api/posts/{post_id}/run", json=step)
        self.assertEqual(response.status_code, 200)
        result = run_step.run(post_id, step_full, username)
        self.assertEqual(json.loads(result['result'])[
                         "code"] == "error", False)
        # 17
        # User2 can not delete post_id
        response = self.client.delete(f"/api/posts/{post_id}")
        self.assertEqual(response.status_code, 422)
        # Public posts can not be deleted
        self.login(create_user=False)
        post.public = True
        db.session.commit()
        response = self.client.delete(f"/api/posts/{post_id}")
        self.assertEqual(response.status_code, 422)
        post.public = False
        db.session.commit()
        # Delete post
        response = self.client.delete(f"/api/posts/{post_id}")
        self.assertEqual(response.status_code, 200)
        # Can not delete inexistent post
        response = self.client.delete("/api/posts/100")
        self.assertEqual(response.status_code, 422)
        # Restore post uploading data again
        result = process_file.run(files, username)
        self.assertEqual(json.loads(result['result'])[
                         0]["code"] == "success", True)

    def test_sync(self):
        """
            1 - Login
            2 - Upload a dataset
            3 - Lock/unlock dataset
            4 - sync_uuid
            5 - Get content
            6 - Put content
            7 - Put fields
            8 - Put data
            9 - Get data
        """
        # 1
        self.login()

        # 2
        data = Dataset().data
        self.tatu.store(data, lazy=False, ignoredup=True)

        # 3
        response = self.client.put("/api/sync/randomuuid/lock")
        self.assertTrue('success' in response.json)
        response = self.client.put("/api/sync/randomuuid/unlock")
        self.assertTrue('success' in response.json)

        # 4
        response = self.client.get("/api/sync_uuid")
        self.assertEqual(response.json['uuid'], self.tatu.id)

        # 5
        response = self.client.get(f"/api/sync/{data.id}/content")
        self.assertEqual(response.status_code, 200)

        # 6
        data2 = Dataset().data >> Let("F", [1, 2, 3])
        file = dict(
            bina=(BytesIO(pack(data2.F)), "bina"),
        )
        response = self.client.post(
            f"/api/sync/{data.id}/content?ignoredup=true", data=file)
        self.assertTrue('success' in response.json)

        # 7
        info = {"rows": [(data.id, "A", data.uuids["X"].id)]}
        response = self.client.post(
            "/api/sync/many?cat=fields&ignoredup=true", json=info)
        msg = (
            "errors" in response.json and response.json["errors"]) or response.json
        self.assertEqual(1, response.json["n"], msg=msg)

        # 8
        data3 = data >> Let("Q", [1, 2])
        dic = {'kwargs': {
            "id": data3.id,
            "step": data3.step.id,
            "inn": None,
            "stream": False,
            "parent": data.id,
            "locked": False,
            "ignoredup": False
        }}
        response = self.client.post("/api/sync?cat=data", json=dic)
        msg = (
            "errors" in response.json and response.json["errors"]) or response.json
        self.assertTrue('success' in response.json, msg)

        # 9
        response = self.client.get(f"/api/sync?cat=data&uuids={data.id}")
        self.assertEqual(response.json['has'], True)
        response = self.client.get("/api/sync?cat=data&uuids=notexistentuuid")
        self.assertEqual(response.json['has'], False)

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
        user2 = User.get_by_username(username2)
        # 2
        username1 = self.login()['username']
        user1 = User.get_by_username(username1)
        # 3
        response = self.client.put("api/users/" + str(username2),
                                   json={"email": "newemail@ll.com"})
        self.assertNotEqual(response.status_code, 200)
        self.assertNotEqual(user2.email, "newemail@ll.com")
        # 4
        response = self.client.put("api/users/" + str(username1),
                                   json={"about_me": "Postdoc"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(user1.about_me, "Postdoc")

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
        response = self.client.get(f"api/users/{username1}/following")
        self.assertEqual(len(response.json), 1)
        response = self.client.get(f"api/users/{username1}/followers")
        self.assertEqual(len(response.json), 0)
        response = self.client.get(f"api/users/{username2}/following")
        self.assertEqual(len(response.json), 0)
        response = self.client.get(f"api/users/{username2}/followers")
        self.assertEqual(len(response.json), 1)
        # 6
        response = self.client.post(f"api/users/{username2}/follow")
        self.assertEqual(response.status_code, 200)
        # 7
        self.assertEqual(len(user2.followers.all()), 0)
        self.assertEqual(len(user1.followers.all()), 0)
        self.assertEqual(len(user1.followed.all()), 0)
        self.assertEqual(len(user2.followed.all()), 0)

    def test_create_post(self):
        self.login()
        iris = Dataset().data
        info = {
            "past": list(iris.past),
            "nattrs": iris.X.shape[1],
            "ninsts": iris.X.shape[0],
            "ntargs": iris.Y.shape[1] if len(iris.Y.shape) > 1 else 1,
            "nclasses": len(set(iris.y))
        }
        response = self.client.put(
            "/api/posts", json={'data_uuid': iris.id, 'info': info})
        self.assertEqual(response.status_code, 200,
                         msg=response.json and response.json["errors"])

        self.tatu.store(iris)

        response = self.client.put(
            "/api/posts/activate", json={'data_uuid': iris.id})
        self.assertEqual(response.status_code, 200,
                         msg=response.json and response.json["errors"])

        response = self.client.put(
            "/api/posts/activate", json={'data_uuid': "inexistent"})
        self.assertEqual(response.status_code, 422)

        response = self.client.put("/api/posts", json={'data_uuid': iris.id})
        self.assertEqual(response.status_code, 422,
                         msg=response.json and response.json["errors"])

    def test_deployment(self):
        """
            1 - Send deployment request
        """
        response = self.client.post("/api/deployment")
        self.assertEqual(response.status_code, 422)
        with patch('app.api.deployment.has_auth'):
            response = self.client.post("/api/deployment")
        self.assertEqual(response.status_code, 422)
        with patch('app.api.deployment.has_auth'):
            with patch('app.api.deployment.subprocess.run'):
                response = self.client.post("/api/deployment")
        self.assertEqual(response.status_code, 201)

    def test_email_confirmation_key(self):
        """
            1 - Create user without confirm email
            2 - Ask new email confirmation key
            3 - Can not ask recovery key to already confirmed email
            4 - Can not ask recovery key to inexistent email
        """
        # 1
        self.login(confirm_email=False)
        user = User.get_by_username(create_user1['username'])
        # 2
        with patch('app.api.tasks.send_async_email.delay'):
            response = self.client.post(
                "/api/users/recover/key", json={"email": user.email})
        self.assertEqual(response.status_code, 200)
        # 3
        user.email_confirmed = True
        db.session.commit()
        # 4
        with patch('app.api.tasks.send_async_email.delay'):
            response = self.client.post(
                "/api/users/recover/key", json={"email": user.email})
        self.assertEqual(response.status_code, 422)
        # 5
        with patch('app.api.tasks.send_async_email.delay'):
            response = self.client.post(
                "/api/users/recover/key", json={"email": "inexistent@email.com"})
        self.assertEqual(response.status_code, 422)


if __name__ == '__main__':
    unittest.main()
