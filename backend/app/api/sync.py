# noinspection PyArgumentList
from app.schemas import (SyncCheckBaseSchema, SyncCheckResponseSchema, SyncPostSchema, SyncPostQuerySchema,
                         SyncResponseSchema, SyncContentFileSchema, SyncFieldsSchema)
from flask import make_response, current_app, jsonify
from flask.views import MethodView
from flask_jwt_extended import jwt_required
from tatu import Tatu

from . import bp


@bp.route("/sync/<string:uuid>")
class SyncCheck(MethodView):
    @jwt_required
    @bp.arguments(SyncCheckBaseSchema, location="query")
    @bp.response(SyncCheckResponseSchema)
    def get(self, args, uuid):  # return None or a row from one of the tables ("cat"s): data, step
        tatu = Tatu(url=current_app.config['TATU_URL'], threaded=False)
        if args['cat'] == "data":
            f = tatu.getdata if args['fetch'] else tatu.hasdata
            # jsonify allows to return None or a dict, which is compatible with the posterior SQL usage of this result
            return jsonify(f(uuid, args['empty']) if args['fetch'] else {"has": f(uuid, args['empty'])})
        if args['cat'] == "step":
            return jsonify(tatu.getstep(uuid) if args['fetch'] else {"has": tatu.hasstep(uuid)})

    @jwt_required
    @bp.arguments(SyncPostQuerySchema, location="query")
    @bp.arguments(SyncPostSchema)
    @bp.response(code=201)
    def post(self, args, argsQuery, uuid):  # insert a dict in one of the tables ("cat"s): data, step
        print(args['cat'], argsQuery['cols'])


@bp.route("/sync/<string:uuid>/lock")
class SyncLock(MethodView):
    @jwt_required
    @bp.response(code=200)
    def put(self, uuid):  # return if insertion of a locked data row succeeded
        print(uuid)


@bp.route("/sync/<string:uuid>/unlock")
class SyncUnlock(MethodView):
    @jwt_required
    @bp.response(code=200)
    def put(self, uuid):  # return if deletion of a locked data row succeeded
        print(uuid)


@bp.route("/sync")
class Sync(MethodView):
    @jwt_required
    @bp.response(SyncResponseSchema)
    def get(self):  # return uuid of tatu-server
        tatu = Tatu(url=current_app.config['TATU_URL'], threaded=False)
        response = {"uuid": tatu.id}
        return response


@bp.route("/sync/<string:uuid>/fields")
class SyncFieldsByUuid(MethodView):
    #     @jwt_required
    #     def get(self, uuid):  # given a data-uuid, return dict of binaries   /  still not used
    #         tatu = Tatu(url=current_app.config['TATU_URL'], threaded=False)
    #         return jsonify(tatu.getfields(uuid))

    @jwt_required
    @bp.arguments(SyncFieldsSchema, location="files")
    @bp.response(code=201)
    def post(self, argFiles, uuid):  # insert list of dicts as rows in table 'field'  /  essential for upload
        tatu = Tatu(url=current_app.config['TATU_URL'], threaded=False)
        return NotImplemented
        # return make_response(tatu.putfields(uuid, argFiles['????????????']))


@bp.route("/sync/<string:uuid>/content")
class SyncContentByUuid(MethodView):
    @jwt_required
    def get(self, uuid):  # return binary [OK]
        tatu = Tatu(url=current_app.config['TATU_URL'], threaded=False)
        ret = tatu.getcontent(uuid)
        return make_response(ret) if ret else jsonify(None)

    @jwt_required
    @bp.arguments(SyncContentFileSchema, location="files")
    @bp.response(code=201)
    def post(self, argFiles, uuid):  # ok
        tatu = Tatu(url=current_app.config['TATU_URL'], threaded=False)
        return make_response(tatu.putcontent(uuid, argFiles['bina']))
