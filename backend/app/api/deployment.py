from . import bp

from flask import request
from flask.views import MethodView
from flask_smorest import abort
from werkzeug.security import check_password_hash


@bp.route('/deployment')
class Deployment(MethodView):
    @bp.response(code=200)
    def post(self):
        """
        Deploy the application after a github webhook
        """
        if 'X-Hub-Signature' not in request.headers:
            abort(422, errors={
                "headers": {"X-Hub-Signature": ["Required header signature. [" + self.__class__.__name__ + "]"]}})
        print(check_password_hash("teste", "teste2"))
        print("run scripts")
