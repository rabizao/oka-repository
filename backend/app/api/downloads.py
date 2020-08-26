from . import bp
from app.schemas import DownloadQuerySchema
from zipfile import ZipFile
from flask import send_from_directory, current_app
from flask.views import MethodView
from flask_smorest import abort
import os
from pjdata.content.specialdata import UUIDData

# Talvez seja uma boa ideia atrelar os downloads ao id do post, assim podemos incrementar post.downloads += 1
# para mostrar quantas vezes cada post foi baixado


@bp.route('/downloads/data')
class Downloads(MethodView):
    # @jwt_required
    @bp.arguments(DownloadQuerySchema, location="query")
    def get(self, args):  # args significa todas as variáveis da classe-schema
        """Download a zipped file containing all the requested datasets"""

        uuids = sorted(args['uuids'])
        storage = current_app.config['CURURU_SERVER']

        filename_server_zip = "_".join(uuids)
        path_server_zip = current_app.static_folder + "/" + filename_server_zip + ".zip"
        if not os.path.isfile(path_server_zip):
            try:
                with ZipFile(path_server_zip, 'w') as zipped_file:
                    for uuid in uuids:
                        data = storage.fetch(UUIDData(uuid))
                        if data is None:
                            raise Exception(
                                "Download failed: " + uuid + " not found!")
                        zipped_file.writestr(
                            uuid + ".arff", data.arff("No name", "No description"))
            except Exception as e:
                os.remove(path_server_zip)
                abort(422, errors={
                    "json": {"uuids": ["zip failed: " + e.args[0]]}})
        return send_from_directory(
            directory=current_app.static_folder,
            filename=filename_server_zip + '.zip',
            as_attachment=True,
            attachment_filename='dataset.zip'
        )
