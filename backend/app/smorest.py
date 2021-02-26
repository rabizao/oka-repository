import http
from flask_smorest import Blueprint as FSBlueprint, Api as FSApi
from flask_jwt_extended import jwt_required


class Blueprint(FSBlueprint):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._prepare_doc_cbks.append(self._prepare_auth_doc)

    @staticmethod
    def auth_required(func):
        func = jwt_required()(func)
        getattr(func, "_apidoc", {})["auth"] = True
        return func

    @staticmethod
    def _prepare_auth_doc(doc, doc_info, **kwargs):
        if doc_info.get("auth", False):
            doc.setdefault("responses", {})["401"] = http.HTTPStatus(401).name
            doc["security"] = [{"bearerAuth": []}]
        return doc


class Api(FSApi):
    """Api override"""

    def __init__(self, app=None, *, spec_kwargs=None):
        super().__init__(app, spec_kwargs=spec_kwargs)
