from flask_smorest import Blueprint

bp = Blueprint('All routes', __name__)

from app.api import auth, cururu, users, posts, downloads, comments, tasks, contacts  # noqa: F401
