from flask_smorest import Blueprint

bp = Blueprint('All routes', __name__)

from app.api import auth, tatu, users, posts, downloads, comments, tasks, contacts, notifications  # noqa: F401
