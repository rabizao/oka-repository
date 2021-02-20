import os
from datetime import timedelta
from dotenv import load_dotenv

from app.utils import is_browser

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '../.env'))


class Config(object):
    SECRET_KEY = os.environ.get('FLASK_SECRET_KEY') or 'you-guess'
    DEPLOYMENT_SECRET_KEY = os.environ.get(
        'DEPLOYMENT_SECRET_KEY') or 'deploy-not-set'
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'app.db')
    TATU_URL = os.environ.get('TATU_URL') or 'sqlite://' + \
        os.path.join(basedir, 'tatu')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') or 1
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    ADMINS = ['okarepository@gmail.com']
    TMP_FOLDER = '/tmp/oka'
    RESET_ACCOUNT_KEY_EXPIRES = timedelta(days=1)

    WEB_TITLE = 'OKA Knowledge Repository'
    API_TITLE = 'oka API'
    API_VERSION = ''
    OPENAPI_VERSION = '3.0.2'
    OPENAPI_JSON_PATH = "api-spec.json"
    OPENAPI_URL_PREFIX = "/docs"
    OPENAPI_REDOC_PATH = ""
    OPENAPI_REDOC_URL = "https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"
    OPENAPI_SWAGGER_UI_PATH = "/swagger"
    OPENAPI_SWAGGER_UI_URL = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"

    CELERY_BROKER_URL = 'redis://localhost:6379/0'
    CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
    CELERY_ACKS_LATE = True
    FRONTEND_HOST = os.environ.get('FRONTEND_HOST') or "http://localhost:3000"

    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY') or 'testpass'
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=15)

    RATELIMIT_DEFAULT = "10/second"
    RATELIMIT_DEFAULTS_EXEMPT_WHEN = is_browser
