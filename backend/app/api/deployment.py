from app.errors.handlers import HTTPAbort
from . import bp

from flask import request, current_app
from flask.views import MethodView
import hashlib
import hmac
import subprocess


@bp.route('/deployment')
class Deployment(MethodView):
    @bp.response(code=201)
    def post(self):
        """
        Deploy the application using github webhook
        """
        if 'X-Hub-Signature' not in request.headers \
            or not hmac.compare_digest(request.headers.get('X-Hub-Signature').split('sha1=')[-1].strip(),
                                       hmac.new(key=bytes(current_app.config['DEPLOYMENT_SECRET_KEY'], 'utf-8'),
                                                msg=request.data, digestmod=hashlib.sha1).hexdigest()):
            HTTPAbort.not_authorized()

        try:
            subprocess.run(
                "/home/oka/deploy.sh")
        except Exception:
            HTTPAbort.unexpected_error()
