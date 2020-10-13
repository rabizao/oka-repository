import json

from flask import current_app, send_from_directory
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
from ..schemas import TatuDownloadSchema, TatuUploadSchema


@bp.route("/tatu")
class TatuData(MethodView):
    @jwt_required
    @bp.arguments(TatuDownloadSchema, location="query")
    def get(self, args):
        """
        Show all posts
        """
        # TODO: está fazendo pack/unpack duas vezes!
        print("get tatu", args)
        storage = current_app.config['TATU_SERVER']
        uuid = args["uuid"]
        # REMINDER: returns PickableData
        packed = pack(storage.fetch_picklable(uuid))
        filename = f"{uuid}.packed"
        with open(current_app.static_folder + "/" + filename, "wb") as f:
            f.write(packed)

        return send_from_directory(
            directory=current_app.static_folder,
            filename=filename,
            as_attachment=True,
            attachment_filename="data.packed"
        )

    @jwt_required
    @bp.arguments(TatuUploadSchema, location="files")
    @bp.response(code=201)
    def post(self, args):
        """
        Create a new Data object (without a related post).
        """
        alias = json.loads(args["json"].read().decode())["alias"]
        storage = current_app.config['TATU_SERVER']
        data = unpack(args['file'].read())
        try:
            storage.store(data)
        except DuplicateEntryException:
            print('Duplicate! Ignored.')
        print("storing OK")

        # TODO: deduplicate this code somewhere else through a function
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        if logged_user.posts.filter_by(data_uuid=data.id).first():
            abort(422, errors={"json": {"Upload": ["Dataset already exists!"]}})

        # Remove delimiters
        name = []
        for uid, step in data.history.items():
            step = json.loads(step.replace("'", '"'))  # TODO remove this after storage/history stop jsonifying steps
            if step["desc"]["name"] not in ["B", "Rev", "E", "AutoIns", "In", "DelIn", "DelStream"]:
                name.append(step["desc"]["name"][0:3])

        if alias:
            name = f"{alias}[{data.id[:4]}] : {''.join(name)}"
        # TODO: isn't cururu storing historystr?
        post = Post(
            author=logged_user, data_uuid=data.id,
            name=name or "No name",
            description="Title and description automatically generated."
        )
        duuid = Root.uuid
        for uid, step in data.history.items():
            step = json.loads(step.replace("'", '"'))  # TODO remove this after storage/history stop jsonifying steps
            if step["desc"]["name"] not in ["B", "Rev", "E", "AutoIns", "In", "DelIn", "DelStream"]:
                dic = {"label": duuid.id, "name": step["desc"]["name"], "help": str(step), "stored": True}  # TODO: stored is useless
                Transformation(**dic, post=post)
                duuid *= UUID(step["id"])
        db.session.add(post)
        db.session.commit()
