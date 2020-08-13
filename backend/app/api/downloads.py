from . import bp
from flask.views import MethodView
from app.schemas import DownloadQuerySchema
from flask import send_from_directory, current_app


@bp.route('/downloads')
class Users(MethodView):
    # @jwt_required
    @bp.arguments(DownloadQuerySchema, location="query")
    def get(self, args):
        """Download a zipped file containing all the requested datasets"""
        if 'uuids' in args:
            print(args['uuids'])
        return send_from_directory(current_app.static_folder,
                                   "iris.arff", as_attachment=True)
