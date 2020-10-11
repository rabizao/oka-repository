from . import bp

from flask import request, current_app
from flask.views import MethodView
from flask_smorest import abort
import hashlib
import hmac


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

        if not hmac.compare_digest(request.headers.get('X-Hub-Signature').split('sha1=')[-1].strip(),
                                   hmac.new(key=bytes(current_app.config['DEPLOYMENT_SECRET_KEY'], 'utf-8'),
                                            msg=request.data, digestmod=hashlib.sha1).hexdigest()):
            abort(422, errors={
                "headers": {"X-Hub-Signature": ["Invalid secret key. [" + self.__class__.__name__ + "]"]}})
        print("run reploy scripts")
