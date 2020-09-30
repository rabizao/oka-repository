import logging
from logging.handlers import SMTPHandler, RotatingFileHandler
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_mail import Mail
from flask_smorest import Api
from flask_jwt_extended import JWTManager
from config import Config
from celery import Celery
from tatu.pickleserver import PickleServer
from flask_socketio import SocketIO
import eventlet

db = SQLAlchemy()
migrate = Migrate()
mail = Mail()
celery = Celery(__name__, broker=Config.CELERY_BROKER_URL)
jwt = JWTManager()
socketio = SocketIO()


def create_app(config_class=Config):
    app = Flask(__name__, static_url_path="/media", static_folder='media')

    app.config.from_object(config_class)
    app.config['TATU_SERVER'] = PickleServer(db=app.static_folder)

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    mail.init_app(app)
    celery.conf.update(app.config)
    jwt.init_app(app)
    eventlet.monkey_patch()

    socketio.init_app(app,
                      message_queue=app.config['SOCKETIO_MESSAGE_QUEUE'], async_mode='eventlet',
                      cors_allowed_origins=app.config['FRONTEND_HOST'])

    api = Api()
    api.init_app(app)

    from . import events  # noqa: F401

    from app.errors import bp as errors_bp
    app.register_blueprint(errors_bp)

    from app.api import bp as api_bp
    api.register_blueprint(api_bp, url_prefix='/api')

    from app.main import bp as main_bp
    app.register_blueprint(main_bp)

    if not os.path.isdir(app.config['TMP_FOLDER']):
        os.mkdir(app.config['TMP_FOLDER'])

    if not app.debug and not app.testing:
        if app.config['MAIL_SERVER']:
            auth = None
            if app.config['MAIL_USERNAME'] or app.config['MAIL_PASSWORD']:
                auth = (app.config['MAIL_USERNAME'],
                        app.config['MAIL_PASSWORD'])
            secure = None
            if app.config['MAIL_USE_TLS']:
                secure = ()
            mail_handler = SMTPHandler(
                mailhost=(app.config['MAIL_SERVER'], app.config['MAIL_PORT']),
                fromaddr='no-reply@' + app.config['MAIL_SERVER'],
                toaddrs=app.config['ADMINS'], subject='oka Failure',
                credentials=auth, secure=secure)
            mail_handler.setLevel(logging.ERROR)
            app.logger.addHandler(mail_handler)

        if not os.path.exists('logs'):
            os.mkdir('logs')
        file_handler = RotatingFileHandler('logs/oka.log',
                                           maxBytes=10240, backupCount=10)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s '
            '[in %(pathname)s:%(lineno)d]'))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)

        app.logger.setLevel(logging.INFO)
        app.logger.info('oka startup')

    return app


from app import models  # noqa: F401
