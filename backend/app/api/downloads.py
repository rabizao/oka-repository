from app import db
from . import bp
from app.schemas import DownloadQuerySchema, TaskBaseSchema
from app.models import User
from flask import request
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity


# Talvez seja uma boa ideia atrelar os downloads ao id do post, assim podemos incrementar post.downloads += 1
# para mostrar quantas vezes cada post foi baixado


@bp.route('/downloads/data')
class Downloads(MethodView):
    @jwt_required
    @bp.arguments(DownloadQuerySchema, location="query")
    @bp.response(TaskBaseSchema)
    def get(self, args):
        """Download a zipped file containing all the requested datasets"""

        pids = sorted(args['pids'])
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        ip = request.environ['REMOTE_ADDR']

        task = logged_user.launch_task('download_data', 'Processing your download',
                                       [pids, username, ip])
        db.session.commit()

        return task
