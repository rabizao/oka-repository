from app import db
from . import bp


@bp.app_errorhandler(404)
def not_found_error(error):
    return {"error": "URL not found."}, 404


@bp.app_errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return {"error": "Internal error."}, 500
