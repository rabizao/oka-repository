# noinspection PyArgumentList

from idict.data.compression import unpack
import simplejson as json2
from flask import make_response, current_app, jsonify
from flask.views import MethodView
from idict.persistence.sqla import sqla, SQLA
from app.api.tasks import create_post
from app.errors.handlers import HTTPAbort

from app.schemas import (SyncResponseSchema, SyncContentFileSchema, SyncFieldsSchema, SyncFieldsQuerySchema,
                         SuccessResponseSchema, NumberResponseSchema, SyncContentQuerySchema, SyncIOSchema,
                         PostFileSchema, ItemInfoSchema)
from . import bp


# @bp.route("/data/<string:id>")

@bp.route("/item/<string:id>")
class SyncItem(MethodView):
    @bp.auth_required
    @bp.arguments(SyncIOSchema, location="query")
    @bp.response(200)
    def get(self, argsQuery, id):
        with sqla(current_app.config['DATA_URL']) as storage:
            if "id" not in storage:
                HTTPAbort.not_found()
            if not argsQuery["checkonly"]:
                return json2.dumps(storage[id])

    @bp.auth_required
    # @bp.arguments(PostFileSchema, location="files")
    @bp.arguments(ItemInfoSchema, location="form")
    @bp.response(201, SuccessResponseSchema)
    def post(self, argsFile, id):
        print(argsFile)
        with sqla(current_app.config['DATA_URL']) as storage:
            if id in storage:
                HTTPAbort.already_uploaded(field="data")
            storage[id] = argsFile["file"].read()
            #     create_post(logged_user, id, "name", "description")


@bp.route("/sync/<string:uuid>/lock")
class SyncLock(MethodView):
    @bp.auth_required
    @bp.response(201, SuccessResponseSchema)
    def put(self, uuid):  # return if insertion of a locked data row succeeded
        tatu = current_app.config['TATU_SERVER']()
        response = {
            "success": tatu.lock(uuid)
        }
        tatu.close()
        return response


@bp.route("/sync/<string:uuid>/unlock")
class SyncUnlock(MethodView):
    @bp.auth_required
    @bp.response(201, SuccessResponseSchema)
    def put(self, uuid):  # return if deletion of a locked data row succeeded
        tatu = current_app.config['TATU_SERVER']()
        response = {
            "success": tatu.unlock(uuid)
        }
        tatu.close()
        return response


# for migration and general Storage identification
@bp.route("/sync_uuid")
class Sync(MethodView):
    @bp.auth_required
    @bp.response(200, SyncResponseSchema)
    def get(self):  # return uuid of tatu-server
        tatu = current_app.config['TATU_SERVER']()
        response = {"uuid": tatu.id}
        tatu.close()
        return response


@bp.route("/sync/<string:uuid>/fields")
class SyncFieldsByUuid(MethodView):
    @bp.auth_required
    @bp.response(200)
    def get(self, uuid):  # given a data-uuid, return dict of binaries   /  still not used
        # tatu =     current_app.config['TATU_SERVER']()

        # input: no body, response:
        response = {
            "bin1": b"\x00\x13...\x31",
            "bin2": b"teste2"
        }
        # print("fffffffffffffffffffields")
        # response = {
        #     "fields": tatu.getfields(uuid)
        # }
        return json2.dumps(response)


@bp.route("/sync/many")
class SyncFields(MethodView):
    @bp.auth_required
    @bp.arguments(SyncFieldsSchema)
    @bp.arguments(SyncFieldsQuerySchema, location="query")
    @bp.response(201, NumberResponseSchema)
    def post(self, args, argsQuery):
        tatu = current_app.config['TATU_SERVER']()
        if argsQuery["cat"] == "fields":
            ret = {"n": tatu.putfields(args['rows'], argsQuery['ignoredup'])}
        elif argsQuery["cat"] == "stream":
            # try:
            ret = {"n": tatu.putstream(args['rows'], argsQuery['ignoredup'])}
            # except Exception as e:
            #     print(e)
        else:
            print("W: Unexpected condition.")
            tatu.close()
            return
        tatu.close()
        return ret


@bp.route("/sync/<string:uuid>/content")
class SyncContentByUuid(MethodView):
    @bp.auth_required
    def get(self, uuid):  # return binary [OK]
        tatu = current_app.config['TATU_SERVER']()
        ret = tatu.getcontent(uuid)
        tatu.close()
        return make_response(ret) if ret else jsonify(None)

    @bp.auth_required
    @bp.arguments(SyncContentFileSchema, location="files")
    @bp.arguments(SyncContentQuerySchema, location="query")
    @bp.response(201, SuccessResponseSchema)
    def post(self, argFiles, argsQuery, uuid):  # ok
        tatu = current_app.config['TATU_SERVER']()
        response = {
            "success": tatu.putcontent(uuid, argFiles['bina'].read(), argsQuery['ignoredup'])
        }
        tatu.close()
        return response
