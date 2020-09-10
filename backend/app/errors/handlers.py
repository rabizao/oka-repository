from app import db
from . import bp
from flask import jsonify


@bp.app_errorhandler(404)
def not_found_error(error):
    return jsonify(errors={"json": {"url": ["Does not exist. [handlers]"]}}), 404


@bp.app_errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify(errors={"json": {"server": ["Internal error."]}}), 500
