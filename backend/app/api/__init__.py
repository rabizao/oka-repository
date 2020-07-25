from flask_smorest import Blueprint

bp = Blueprint('All routes', __name__)

from app.api import auth, users, posts, experiments  # noqa: F401
