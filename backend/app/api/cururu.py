import json

from flask import current_app, send_from_directory
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_smorest import abort

from app.schemas import (CururuUploadSchema, CururuDownloadSchema)
from cururu.persistence import DuplicateEntryException
from pjdata.aux.compression import unpack, pack
from pjdata.content.specialdata import UUIDData
from . import bp
# noinspection PyArgumentList
from .. import db
from ..models import Transformation, User, Post


@bp.route("/cururu")
class CururuData(MethodView):
    @jwt_required
    @bp.arguments(CururuDownloadSchema, location="query")
    def get(self, args):
        """
        Show all posts
        """
        # TODO: está fazendo pack/unpack duas vezes!
        storage = current_app.config['CURURU_SERVER']
        uuid = args["uuid"]
        packed = pack(storage.fetch(UUIDData(uuid)))
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
    @bp.arguments(CururuUploadSchema, location="files")
    @bp.response(code=201)
    def post(self, args):
        """
        Create a new Data object (without a related post).
        """
        create_post = json.loads(args["json"].read().decode())["create_post"]
        storage = current_app.config['CURURU_SERVER']
        data = unpack(args['file'].getbuffer())
        try:
            storage.store(data)
        except DuplicateEntryException:
            print('Duplicate! Ignored.')

        # TODO: deduplicate this code somewhere else through a function
        if create_post:
            username = get_jwt_identity()
            logged_user = User.get_by_username(username)
            if logged_user.posts.filter_by(data_uuid=data.id).first():
                abort(422, errors={"json": {"Upload": ["Dataset already exists!"]}})
            post = Post(
                author=logged_user, data_uuid=data.id,
                name="←".join([i["name"] for i in reversed(list(data.historystr))]),
                description="Title and description automatically generated."
            )
            for dic in storage.visual_history(data.id, current_app.static_folder):
                Transformation(**dic, post=post)
            db.session.add(post)
            db.session.commit()

#
# @bp.route('/posts/<int:id>')
# class PostsById(MethodView):
#     @bp.response(PostBaseSchema)
#     def get(self, id):
#         """
#         Show info about the post with id {id}
#         """
#         post = Post.query.get(id)
#         if not post or not post.active:
#             abort(422, errors={"json": {"id": ["Does not exist."]}})
#         return post
#
#     @jwt_required
#     @bp.arguments(PostEditSchema)
#     @bp.response(code=200)
#     def put(self, args, id):
#         """
#         Edit post with id {id}
#         """
#         logged_user = User.get_by_username(get_jwt_identity())
#         post = Post.query.get(id)
#
#         if not post or not post.active:
#             abort(422, errors={"json": {"id": ["Does not exist."]}})
#
#         if not logged_user.is_admin():
#             if logged_user != post.author:
#                 abort(422, errors={
#                     "json": {"id": ["You can only edit your own datasets."]}})
#
#         post.update(args)
#         db.session.commit()
