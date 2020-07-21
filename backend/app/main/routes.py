from . import bp
from flask import url_for, render_template_string


@bp.route('/', methods=['GET'])
def index():
    return render_template_string(
        "Access documentation at <a href='{}'>redocs</a> or <a href='{}'>swaggerdocs</a>".format(
            url_for('api-docs.openapi_redoc'),
            url_for('api-docs.openapi_swagger_ui')))
