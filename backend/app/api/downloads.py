from app import db
from . import bp
from app.schemas import DownloadQuerySchema, TaskBaseSchema
from app.models import User
from flask import request
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
