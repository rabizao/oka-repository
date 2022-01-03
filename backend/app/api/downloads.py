import os
from io import BytesIO
from app import db
from app.errors.handlers import HTTPAbort
from . import bp
from app.schemas import DownloadFileByNameQuerySchema, DownloadQueryIdSchema, DownloadQuerySchema, TaskBaseSchema
from app.models import User
from flask import request, current_app, send_from_directory, send_file
from flask.views import MethodView
from flask_jwt_extended import get_jwt_identity


# @bp.route('/downloads/data')
# class Downloads(MethodView):
#     @bp.auth_required
#     @bp.arguments(DownloadQuerySchema, location="query")
#     @bp.response(201, TaskBaseSchema)
#     def post(self, args):
#         """Launch a task to download a zipped file containing all the requested datasets"""
#         ids = sorted(args['ids'])
#         username = get_jwt_identity()
#         logged_user = User.get_by_username(username)
#         ip = request.environ['REMOTE_ADDR']

#         task = logged_user.launch_task('download_data', 'Processing your download',
#                                        [ids, username, ip])
#         db.session.commit()

#         return task

#     @bp.auth_required
#     @bp.arguments(DownloadFileByNameQuerySchema, location="query")
#     def get(self, args):
#         """Download a file by the generated file id"""
#         logged_user = User.get_by_username(get_jwt_identity())
#         path = f"{current_app.config['TMP_FOLDER']}/{args['name']}"
#         file = logged_user.get_file_by_name(args['name'])

#         if not os.path.isfile(path) or not file:
#             HTTPAbort.not_found("name")

#         return send_from_directory(current_app.config['TMP_FOLDER'], args['name'], as_attachment=True)


@bp.route('/downloads/posts')
class DownloadsByPostId(MethodView):
    @bp.auth_required
    @bp.arguments(DownloadQuerySchema, location="query")
    @bp.response(201, TaskBaseSchema)
    def post(self, args):
        """Launch a task to download a zipped file containing all the datasets of the given posts ids"""
        ids = sorted(args['ids'])
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        ip = request.environ['REMOTE_ADDR']

        task = logged_user.launch_task('download_data', 'Processing your download',
                                       [ids, username, ip])
        db.session.commit()

        return task


@bp.route('/downloads/files')
class DownloadsByPostId(MethodView):
    @bp.auth_required
    @bp.arguments(DownloadQueryIdSchema, location="query")
    def get(self, args):
        """Download a file by the generated file id"""
        logged_user = User.get_by_username(get_jwt_identity())

        print(logged_user.files.filter_by(id=args['id']).first())

        file = logged_user.files.filter_by(id=args['id']).first()

        if not file or not file.blob:
            HTTPAbort.not_found("id")

        io = BytesIO(file.blob)
        print(file.blob)

        return send_file(io, download_name=file.name, as_attachment=True)
