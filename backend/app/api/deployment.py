from . import bp

from flask import request, current_app
from flask.views import MethodView
from flask_smorest import abort
from werkzeug.security import check_password_hash


@bp.route('/deployment')
class Deployment(MethodView):
    @bp.response(code=200)
    def post(self):
        """
        Deploy the application using github webhook
        """
        if 'X-Hub-Signature' not in request.headers:
            abort(422, errors={
                "headers": {"X-Hub-Signature": ["Required header signature. [" + self.__class__.__name__ + "]"]}})
        if not check_password_hash(str(request.headers['X-Hub-Signature']),
                                   current_app.config['DEPLOYMENT_SECRET_KEY']):
            abort(422, errors={
                "headers": {"X-Hub-Signature": ["Invalid secret key. [" + self.__class__.__name__ + "]"]}})
        print("run reploy scripts")