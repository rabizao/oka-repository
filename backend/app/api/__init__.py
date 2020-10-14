from flask_smorest import Blueprint

bp = Blueprint('All routes', __name__)

from app.api import (auth, sync, users, posts, downloads, comments, tasks,  # noqa: F401
                     contacts, notifications, deployment)  # noqa: F401
