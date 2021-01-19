#  Copyright (c) 2020. Davi Pereira dos Santos
#  This file is part of the oka-repository project.
#  Please respect the license. Removing authorship by any means
#  (by code make up or closing the sources) or ignoring property rights
#  is a crime and is unethical regarding the effort and time spent here.
#  Relevant employers or funding agencies will be notified accordingly.
#
#  oka-repository is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  oka-repository is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with oka-repository.  If not, see <http://www.gnu.org/licenses/>.
#

import os
from datetime import timedelta
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '../.env'))


class Config(object):
    SECRET_KEY = os.environ.get('FLASK_SECRET_KEY') or 'you-guess'
    DEPLOYMENT_SECRET_KEY = os.environ.get('DEPLOYMENT_SECRET_KEY') or 'deploy-not-set'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'app.db')
    TATU_URL = os.environ.get('TATU_URL') or 'sqlite://' + os.path.join(basedir, 'tatu')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') or 1
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    ADMINS = ['okarepository@gmail.com']
    TMP_FOLDER = '/tmp/oka/'

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
