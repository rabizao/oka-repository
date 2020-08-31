import uuid as u
from io import BytesIO

from flask import current_app
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_smorest import abort

from app import db
from app.models import User, Post
from app.schemas import (PostQuerySchema, PostBaseSchema, PostEditSchema, CururuUploadSchema, CururuDownloadSchema)
from cururu.persistence import DuplicateEntryException
from pjdata.aux.compression import unpack, pack
from pjdata.creation import read_arff
from . import bp


# noinspection PyArgumentList
@bp.route("/cururu")
class Posts(MethodView):
    @jwt_required
    @bp.arguments(CururuDownloadSchema, location="query")
    def get(self, args):
        """
        Show all posts
        """
        storage = current_app.config['CURURU_SERVER']
        return BytesIO(pack(storage.fetch(args["uuid"])))  #TODO: está fazendo pack/unpack duas vezes!

    @jwt_required
    @bp.arguments(CururuUploadSchema, location="files")
    @bp.response(code=201)
    def post(self, args):
        """
        Create a new Data object (without a related post).
        """
        storage = current_app.config['CURURU_SERVER']
        data = unpack(args['file'].getbuffer())
        try:
            storage.store(data)
        except DuplicateEntryException:
            print('Duplicate! Ignored.')

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
