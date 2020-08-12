from . import bp
from flask.views import MethodView
from app.schemas import DownloadQuerySchema


@bp.route('/downloads')
class Users(MethodView):
    # @jwt_required
    @bp.arguments(DownloadQuerySchema, location="query")
    @bp.response(code=200)
    def get(self, args):
        """Download a zipped file containing all the requested datasets"""
        print(args['uuids'])
