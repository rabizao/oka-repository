from flask import make_response, current_app
from flask.views import MethodView
from flask_jwt_extended import jwt_required

from tatu.sql.mysql import MySQL
from . import bp
# noinspection PyArgumentList
from app.schemas import (SyncCheckBaseSchema, SyncCheckResponseSchema,
                         SyncPostSchema, SyncPostQuerySchema, SyncResponseSchema, SyncContentFileSchema)


@bp.route("/sync/<string:uuid>")
class SyncCheck(MethodView):
    @jwt_required
    @bp.arguments(SyncCheckBaseSchema, location="query")
    @bp.response(SyncCheckResponseSchema)
    def get(self, args, uuid):
        if args['fetch']:
            if args['cat']=="data":
                response = {
                    'uuids': {'dasoijdo': True, 'sdewqr': False, 'hfddgf': False}
                }
        return response

    @jwt_required
    @bp.arguments(SyncPostQuerySchema, location="query")
    @bp.arguments(SyncPostSchema)
    @bp.response(code=201)
    def post(self, args, argsQuery, uuid):
        print(args['cat'], argsQuery['cols'])


@bp.route("/sync/<string:uuid>/lock")
class SyncLock(MethodView):
    @jwt_required
    @bp.response(code=200)
    def put(self, uuid):  # ok
        print(uuid)


@bp.route("/sync/<string:uuid>/unlock")
class SyncUnlock(MethodView):
    @jwt_required
    @bp.response(code=200)
    def put(self, uuid):  # ok
        print(uuid)


@bp.route("/sync")
class Sync(MethodView):
    @jwt_required
    @bp.response(SyncResponseSchema)
    def get(self):  # ok
        tatu = MySQL(db=current_app.config['TATU_URL'], threaded=False)
        response = {"uuid": tatu.id}
        return response


@bp.route("/sync/<string:uuid>/content")
class SyncContentByUuid(MethodView):
    @jwt_required
    def get(self, uuid):  # ok
        return make_response(b"data")

    @jwt_required
    @bp.arguments(SyncContentFileSchema, location="files")
    @bp.response(code=201)
    def post(self, argFiles, uuid):  # ok
        print(uuid, argFiles['dump'])
