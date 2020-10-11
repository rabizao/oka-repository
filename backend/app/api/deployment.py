from . import bp

from flask import request, current_app
from flask.views import MethodView
from flask_smorest import abort
import hashlib
import hmac
import subprocess


@bp.route('/deployment')
class Deployment(MethodView):
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

        try:
            output = {"output": str(subprocess.check_output(
                "nohup ~/deploy.sh > ~/deploy_log.txt 2>&1 &", shell=True))}
        except Exception as e:
            print("error")
            abort(422, errors={
                "json": {"Internal Error": [f"{str(e)} [" + self.__class__.__name__ + "]"]}})
        return output, 200
