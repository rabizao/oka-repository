# noinspection PyArgumentList

from io import BytesIO

import simplejson as json2
from flask import make_response, current_app, jsonify
from flask import send_file
from flask.views import MethodView
from flask_jwt_extended.utils import get_jwt_identity

from app.api.tasks import create_post
from app.errors.handlers import HTTPAbort
from app.models import User
from app.schemas import (FoundResponseSchema, SyncResponseSchema, SyncContentFileSchema, SyncFieldsSchema,
                         SyncFieldsQuerySchema,
                         SuccessResponseSchema, NumberResponseSchema, SyncContentQuerySchema, PostFileSchema,
                         ItemInfoSchema)
from idict.persistence.sqla import sqla
from . import bp


# @bp.route("/data/<string:id>")


@bp.route("/item/<string:id>/check")
class SyncItem(MethodView):
    @bp.auth_required
    @bp.response(200, FoundResponseSchema)
    def get(self, id):
        with sqla(current_app.config['DATA_URL'], user_id=get_jwt_identity()) as storage:
            return {"found": id in storage}


@bp.route("/item/<string:id>")
class SyncItem(MethodView):
    @bp.auth_required
    @bp.response(200)
    def get(self, id):
        with sqla(current_app.config['DATA_URL'], user_id=get_jwt_identity(), autopack=False) as storage:
            if id not in storage and (id := "_" + id[1:]) not in storage:
                HTTPAbort.not_found()
            return send_file(BytesIO(storage[id]), mimetype="application/octet-stream")

    @bp.auth_required
    @bp.arguments(PostFileSchema, location="files")
    @bp.arguments(ItemInfoSchema, location="form")
    @bp.response(201, SuccessResponseSchema)
    def post(self, argsFile, argsForm, id):
        logged_user = User.get_by_username(get_jwt_identity())
        sqlaid = ("_" + id[1:]) if argsForm["create_post"] else id
        with sqla(current_app.config["DATA_URL"], user_id=get_jwt_identity(), autopack=False) as storage:
            if sqlaid in storage:
                HTTPAbort.already_uploaded(field="data")
            if argsForm["create_post"]:
                create_post(logged_user, id)
            storage[sqlaid] = argsFile["file"].read()


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
