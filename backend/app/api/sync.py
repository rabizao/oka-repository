import json

from flask import current_app, send_from_directory, jsonify
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_smorest import abort

from aiuna.content.root import Root
from cruipto.uuid import UUID
from tatu.storage import DuplicateEntryException
from aiuna.compression import unpack, pack
from . import bp
# noinspection PyArgumentList
from .. import db
from ..models import Transformation, User, Post
from ..schemas import TatuUploadSchema, SyncSchema


@bp.route("/sync/<string:uuid>")
class SyncByUUID(MethodView):
    @jwt_required
    @bp.arguments(SyncSchema, location="query")
    def get(self, args, uuid):
        dryrun = args["dryrun"]
        storage = current_app.config['TATU_SERVER']
        if dryrun:
            return jsonify(storage.hasdata(uuid)), 200
        else:
            return storage.getdata(uuid), 200
