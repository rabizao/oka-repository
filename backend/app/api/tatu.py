import json

from flask import current_app, send_from_directory
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_smorest import abort

from tatu.persistence import DuplicateEntryException
from aiuna.compression import unpack, pack
from aiuna.content.specialdata import UUIDData
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
        packed = pack(storage.fetch_pickable(UUIDData(uuid)))
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
        print("post tatu")
        create_post = json.loads(args["json"].read().decode())["create_post"]
        print("CCCCCCCCCCCCCCCCCCCCCCCCCC", create_post)
        storage = current_app.config['TATU_SERVER']
        print("Unpacking...")
        data = unpack(args['file'].read())
        print("Unpacking ok")
        try:
            print(f"storing...{type(data)} {data} <<<<<<<<<<<")
            storage.store(data)
        except DuplicateEntryException:
            print('Duplicate! Ignored.')
        print("storing OK")

        # TODO: deduplicate this code somewhere else through a function
        print("create post...?")
        if create_post:
            print("create post...")
            username = get_jwt_identity()
            logged_user = User.get_by_username(username)
            print("check already exists...")
            if logged_user.posts.filter_by(data_uuid=data.id).first():
                abort(422, errors={"json": {"Upload": ["Dataset already exists!"]}})
            name = "←".join([i["name"] for i in reversed(list(storage.visual_history(data)))])
            # TODO: isn't cururu storing historystr?
            post = Post(
                author=logged_user, data_uuid=data.id,
                name=name or "No name",
                description="Title and description automatically generated."
            )
            print("create Transformations...")
            for dic in storage.visual_history(data.id, current_app.static_folder):
                Transformation(**dic, post=post)
            db.session.add(post)
            print("commit...")
            db.session.commit()
            print("commit ok")
