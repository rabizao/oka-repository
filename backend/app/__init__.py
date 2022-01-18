import logging
import os
from logging.handlers import SMTPHandler, RotatingFileHandler

from celery import Celery
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail
from flask_migrate import Migrate
from flask_smorest import Api
from flask_sqlalchemy import SQLAlchemy

from .config import Config

db = SQLAlchemy()
migrate = Migrate()
mail = Mail()
celery = Celery(__name__, broker=Config.CELERY_BROKER_URL)
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address)


def create_app(config_class=Config):
    app = Flask(__name__, static_url_path="/media",
                static_folder='media')

    app.config.from_object(config_class)
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, expose_headers=["X-Pagination"])
    mail.init_app(app)
    celery.conf.update(app.config)
    jwt.init_app(app)
    limiter.init_app(app)

    api = Api(app)
    api.spec.components.security_scheme(
        "bearerAuth", {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"})

    from app.errors import bp as errors_bp
    app.register_blueprint(errors_bp)

    from app.api import bp as api_bp
    api.register_blueprint(api_bp, url_prefix='/api')

    from app.main import bp as main_bp
    app.register_blueprint(main_bp)

    if not app.debug and not app.testing:
        app.logger = logging.getLogger("oka_logger")
        if not app.logger.handlers:
            if app.config['MAIL_SERVER']:
                auth = None
                if app.config['MAIL_USERNAME'] or app.config['MAIL_PASSWORD']:
                    auth = (app.config['MAIL_USERNAME'],
                            app.config['MAIL_PASSWORD'])
                secure = None
                if app.config['MAIL_USE_TLS']:
                    secure = ()
                mail_handler = SMTPHandler(
                    mailhost=(app.config['MAIL_SERVER'],
                              app.config['MAIL_PORT']),
                    fromaddr='no-reply@' + app.config['MAIL_SERVER'],
                    toaddrs=app.config['ADMINS'], subject='oka Failure',
                    credentials=auth, secure=secure)
                mail_handler.setLevel(logging.ERROR)
                app.logger.addHandler(mail_handler)

            if not os.path.exists('logs'):
                os.mkdir('logs')
            file_handler = RotatingFileHandler('logs/oka.log',
                                               maxBytes=10240, backupCount=10)
            file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s '
                                                        '[in %(pathname)s:%(lineno)d]'))
            file_handler.setLevel(logging.INFO)
            app.logger.addHandler(file_handler)

            app.logger.setLevel(logging.INFO)
            app.logger.info('oka startup')

    return app


from . import models  # noqa: F401
