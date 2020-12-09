# noinspection PyArgumentList
from app.schemas import (SyncCheckBaseSchema, SyncCheckResponseSchema, SyncPostSchema, SyncPostQuerySchema,
                         SyncResponseSchema, SyncContentFileSchema, SyncFieldsSchema, SyncFieldsQuerySchema,
                         SuccessResponseSchema, NumberResponseSchema)
from flask import make_response, current_app, jsonify
from flask.views import MethodView
from flask_jwt_extended import jwt_required

import simplejson as json2

from . import bp


@bp.route("/sync")
class SyncCheck(MethodView):
    @jwt_required
    @bp.arguments(SyncCheckBaseSchema, location="query")
    @bp.response(SyncCheckResponseSchema)
    def get(self, args):  # return None or a row from one of the tables ("cat"s): data, step
        tatu = current_app.config['TATU_SERVER']
        uuid = args["uuids"][0]  # TODO: Implement get/has multiple data and multiple steps.
        if args['cat'] == "data":
            f = tatu.getdata if args['fetch'] else tatu.hasdata
            # jsonify allows to return None or a dict, which is compatible with the posterior SQL usage of this result
            return jsonify(f(uuid, args['empty']) if args['fetch'] else {"has": f(uuid, args['empty'])})
        if args['cat'] == "step":
            return jsonify(tatu.getstep(uuid) if args['fetch'] else {"has": tatu.hasstep(uuid)})
        if args['cat'] == "content":
            return jsonify(tatu.getcontent(uuid) if args['fetch'] else {"has": tatu.hascontent(args["uuids"])})

    @jwt_required
    @bp.arguments(SyncPostQuerySchema, location="query")
    @bp.arguments(SyncPostSchema)
    @bp.response(SuccessResponseSchema)
    def post(self, args, argsQuery):  # insert a dict in one of the tables ("cat"s): data, step
        tatu = current_app.config['TATU_SERVER']
        kwargs = argsQuery['kwargs']
        if args['cat'] == "data":
            return {"success": tatu.putdata(**kwargs)}
        if args['cat'] == "step":
            return {"success": tatu.putstep(**kwargs)}
        if args['cat'] == "content":
            return {"success": tatu.putcontent(**kwargs)}


@bp.route("/sync/<string:uuid>/lock")
class SyncLock(MethodView):
    @jwt_required
    @bp.response(SuccessResponseSchema)
    def put(self, uuid):  # return if insertion of a locked data row succeeded
        tatu = current_app.config['TATU_SERVER']
        response = {
            "success": tatu.lock(uuid)
        }
        return response


@bp.route("/sync/<string:uuid>/unlock")
class SyncUnlock(MethodView):
    @jwt_required
    @bp.response(SuccessResponseSchema)
    def put(self, uuid):  # return if deletion of a locked data row succeeded
        tatu = current_app.config['TATU_SERVER']
        response = {
            "success": tatu.unlock(uuid)
        }
        return response


# for migration and general Storage identification
@bp.route("/sync_uuid")
class Sync(MethodView):
    @jwt_required
    @bp.response(SyncResponseSchema)
    def get(self):  # return uuid of tatu-server
        tatu = current_app.config['TATU_SERVER']
        response = {"uuid": tatu.id}
        return response


@bp.route("/sync/<string:uuid>/fields")
class SyncFieldsByUuid(MethodView):
    @jwt_required
    @bp.response(code=200)
    def get(self, uuid):  # given a data-uuid, return dict of binaries   /  still not used
        # tatu =     current_app.config['TATU_SERVER']

        # input: no body, response:
        response = {
            "bin1": b"\x00\x13...\x31",
            "bin2": b"teste2"
        }
        # response = {
        #     "fields": tatu.getfields(uuid)
        # }
        return json2.dumps(response)


@bp.route("/sync/fields")
class SyncFields(MethodView):
    @jwt_required
    @bp.arguments(SyncFieldsSchema)
    @bp.arguments(SyncFieldsQuerySchema, location="query")
    @bp.response(NumberResponseSchema)
    def post(self, args, argsQuery):
        tatu = current_app.config['TATU_SERVER']
        response = {
            "n": tatu.putfields(args['rows'], argsQuery['ignoredup'])
        }
        return response


@bp.route("/sync/<string:uuid>/content")
class SyncContentByUuid(MethodView):
    @jwt_required
    def get(self, uuid):  # return binary [OK]
        tatu = current_app.config['TATU_SERVER']
        ret = tatu.getcontent(uuid)
        return make_response(ret) if ret else jsonify(None)

    @jwt_required
    @bp.arguments(SyncContentFileSchema, location="files")
    @bp.arguments(SyncFieldsQuerySchema, location="query")
    @bp.response(SuccessResponseSchema)
    def post(self, argFiles, argsQuery, uuid):  # ok
        tatu = current_app.config['TATU_SERVER']
        response = {
            "success": tatu.putcontent(uuid, argFiles['bina'].read(), argsQuery['ignoredup'])
        }
        return response
