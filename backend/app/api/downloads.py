from io import BytesIO
from app import db
from app.errors.handlers import HTTPAbort
from . import bp
from app.schemas import DownloadQueryIdSchema, DownloadQuerySchema, TaskBaseSchema
from app.models import User
from flask import request, send_file
from flask.views import MethodView
from flask_jwt_extended import get_jwt_identity


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
class DownloadsByFileId(MethodView):
    @bp.auth_required
    @bp.arguments(DownloadQueryIdSchema, location="query")
    def get(self, args):
        """Download a file by the generated file id"""
        logged_user = User.get_by_username(get_jwt_identity())
        file = logged_user.files.filter_by(id=args['id']).first()

        if not file or not file.blob:
            HTTPAbort.not_found("id")

        io = BytesIO(file.blob)

        return send_file(io, download_name=file.name, as_attachment=True)
