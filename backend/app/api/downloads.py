import os
from app import db
from app.errors.handlers import HTTPAbort
from . import bp
from app.schemas import DownloadFileByNameQuerySchema, DownloadQuerySchema, TaskBaseSchema
from app.models import User
from flask import request, current_app, send_from_directory
from flask.views import MethodView
from flask_jwt_extended import get_jwt_identity


@bp.route('/downloads/data')
class Downloads(MethodView):
    @bp.auth_required
    @bp.arguments(DownloadQuerySchema, location="query")
    @bp.response(TaskBaseSchema)
    def post(self, args):
        """Launch a task to download a zipped file containing all the requested datasets"""
        pids = sorted(args['pids'])
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        ip = request.environ['REMOTE_ADDR']

        task = logged_user.launch_task('download_data', 'Processing your download',
                                       [pids, username, ip])
        db.session.commit()

        return task

    @bp.auth_required
    @bp.arguments(DownloadFileByNameQuerySchema, location="query")
    def get(self, args):
        """Download a file by the generated file id"""
        logged_user = User.get_by_username(get_jwt_identity())
        path = f"{current_app.config['TMP_FOLDER']}/{args['name']}"
        file = logged_user.get_file_by_name(args['name'])

        if not os.path.isfile(path) or not file:
            HTTPAbort.not_found("name")

        return send_from_directory(current_app.config['TMP_FOLDER'], args['name'], as_attachment=True)
