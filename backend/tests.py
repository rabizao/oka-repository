#!/usr/bin/env python
import unittest
from app import create_app, db
from app.models import Job
from config import Config


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

    def test_new_tag(self):
        job = Job(uuid='uuidtest')
        tag = job.new_tag(name="Tag1")
        db.session.add(job)
        db.session.commit()
        self.assertTrue(job.tags.all()[0].name == "Tag1")
        self.assertTrue(tag.job == job)


if __name__ == '__main__':
    unittest.main(verbosity=2)
