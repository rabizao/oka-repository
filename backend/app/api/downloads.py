from app import db
from . import bp
from app.schemas import DownloadQuerySchema, TaskBaseSchema
from app.models import User
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity


# Talvez seja uma boa ideia atrelar os downloads ao id do post, assim podemos incrementar post.downloads += 1
# para mostrar quantas vezes cada post foi baixado


@bp.route('/downloads/data')
class Downloads(MethodView):
    @jwt_required
    @bp.arguments(DownloadQuerySchema, location="query")
    @bp.response(TaskBaseSchema)
    def get(self, args):  # args significa todas as variáveis da classe-schema
        """Download a zipped file containing all the requested datasets"""

        uuids = sorted(args['uuids'])
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)

        task = logged_user.launch_task('download_data', 'Processing your download',
                                       [uuids])
        db.session.commit()

        return task
