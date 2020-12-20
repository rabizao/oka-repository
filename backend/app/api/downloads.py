from app import db
from . import bp
from app.schemas import DownloadQuerySchema, TaskBaseSchema, DownloadFileByNameQuerySchema
from app.models import User
from flask import request, current_app, send_from_directory
from flask_smorest import abort
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity
import os


# Talvez seja uma boa ideia atrelar os downloads ao id do post, assim podemos incrementar post.downloads += 1
# para mostrar quantas vezes cada post foi baixado


@bp.route('/downloads/data')
class DownloadsByPid(MethodView):
    @jwt_required
    @bp.arguments(DownloadQuerySchema, location="query")
    @bp.response(TaskBaseSchema)
    def post(self, args):
        """Start a task to generate a zipped file containing all the requested datasets"""

        pids = sorted(args['pids'])
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        ip = request.environ['REMOTE_ADDR']

        task = logged_user.launch_task('download_data', 'Processing your download',
                                       [pids, username, ip])
        db.session.commit()

        return task


@bp.route('/downloads')
class DownloadsByFid(MethodView):
    @jwt_required
    @bp.arguments(DownloadFileByNameQuerySchema, location="query")
    def get(self, args):
        """Download a file by the generated file id"""
        logged_user = User.get_by_username(get_jwt_identity())
        path = f"{current_app.config['TMP_FOLDER']}/{args['name']}"
        file = logged_user.get_file_by_name(args['name'])

        if not os.path.isfile(path) or not file:
            abort(422, errors={
                "json": {"name": ["File not found."]}})

        with open(path) as f:
            if not logged_user.can_download(file):
                abort(422, errors={
                    "json": {"name": ["You do not have access to this file."]}})

            return send_from_directory(current_app.config['TMP_FOLDER'], args['name'], as_attachment=True)
