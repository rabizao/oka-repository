from . import bp

from flask import request
from flask.views import MethodView
from werkzeug.security import check_password_hash


@bp.route('/deployment')
class Deployment(MethodView):
    @bp.response(code=200)
    def post(self):
        """
        Deploy the application after a github webhook
        """
        print(request.headers)
        print(check_password_hash("teste", "teste2"))
        print("run scripts")
