from app import db
from . import bp
from app.schemas import DownloadQuerySchema
from .tasks import celery_download_data
from app.models import User, Task
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity


# Talvez seja uma boa ideia atrelar os downloads ao id do post, assim podemos incrementar post.downloads += 1
# para mostrar quantas vezes cada post foi baixado


@bp.route('/downloads/data')
class Downloads(MethodView):
    @jwt_required
    @bp.arguments(DownloadQuerySchema, location="query")
    def get(self, args):  # args significa todas as variáveis da classe-schema
        """Download a zipped file containing all the requested datasets"""

        uuids = sorted(args['uuids'])
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)

        job = celery_download_data.apply_async([uuids])
        task = Task(id=job.id, name="Data processing",
                    description="Processing your download: " + ", ".join(uuids), user=logged_user)
        db.session.add(task)
        db.session.commit()

        return job.id
