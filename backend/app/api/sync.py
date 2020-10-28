from flask import current_app, jsonify
from flask.views import MethodView
from flask_jwt_extended import jwt_required

from . import bp
# noinspection PyArgumentList
from ..schemas import SyncSchema
from tatu.sql.mysql import MySQL


@bp.route("/sync/<string:uuid>")
class SyncByUUID(MethodView):
    @jwt_required
    @bp.arguments(SyncSchema, location="query")
    def get(self, args, uuid):
        dryrun = args["dryrun"]
        tatu = MySQL(db=current_app.config['TATU_URL'], threaded=False)
        if dryrun:
            return jsonify(tatu.hasdata(uuid)), 200
        else:
            return tatu.getdata(uuid), 200
