import os
from zipfile import ZipFile

from flask import current_app
from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_mail import Message
from flask_smorest import abort

from app import mail, celery, db, socketio
from app.models import User, Task, Transformation, Post
from app.schemas import TaskBaseSchema

from aiuna.file import File
from tatu.storage import DuplicateEntryException
from aiuna.content.specialdata import UUIDData
from aiuna.creation import read_arff
from . import bp


@celery.task
def send_async_email(message):
    """
    Background task to send an email
    """
    msg = Message('[Oka - Contato]', sender=current_app.config['ADMINS'][0],
                  recipients=[*current_app.config['ADMINS']])
    msg.html = message

    with current_app.app_context():
        mail.send(msg)


@celery.task(bind=True)
def celery_download_data(self, uuids):
    """
    Background task to run async download process
    """

    storage = current_app.config['TATU_SERVER']

    filename_server_zip = "_".join(uuids)
    path_server_zip = current_app.static_folder + "/" + filename_server_zip + ".zip"
    if not os.path.isfile(path_server_zip):
        try:
            with ZipFile(path_server_zip, 'w') as zipped_file:
                for uuid in uuids:
                    actual_index = uuids.index(uuid)
                    self.update_state(state='PROGRESS', meta={
                        'current': actual_index / len(uuids) * 100,
                        'total': 100,
                        'status': f"Processing file {str(actual_index)} of {str(len(uuids))}"
                    })
                    data = storage.fetch(UUIDData(uuid))
                    if data is None:
                        raise Exception(
                            "Download failed: " + uuid + " not found!")
                    zipped_file.writestr(uuid + ".arff", data.arff("No name", "No description"))
        except Exception as e:
            os.remove(path_server_zip)
            self.update_state(state='FAILURE', meta={
                'current': 100,
                'total': 100,
                'status': f"Zip failed with status {e.args[0]}"
            })
            abort(422, errors={"json": {"zipping&arffing": [str(e)]}})

    task = Task.query.get(self.request.id)
    if task:
        task.complete = True
        db.session.commit()

    result = {'current': 100, 'total': 100,
              'status': 'done', 'result': filename_server_zip + ".zip"}

    return result


@celery.task(bind=True)
def celery_process_data(self, files, username, sid):
    """
    Background task to run async post process
    """

    logged_user = User.get_by_username(username)
    report = {}

    for file in files:
        actual_index = files.index(file)
        self.update_state(state='PROGRESS', meta={
            'current': actual_index / len(files) * 100,
            'total': 100,
            'status': f"Processing file {str(actual_index)} of {str(len(files))}"
        })

        # TODO: remove redundancy
        name = file["path"].split("/")[-1]
        path = "/".join(file["path"].split("/")[:-1]) + "/"
        f = File(name, path)
        name, description = f.dataset, f.description
        data = f.data

        if logged_user.posts.filter_by(data_uuid=data.id).first():
            print("Dataset already exists!")
            report[file["original_name"]] = "Error! Dataset already uploaded"
            continue

        storage = current_app.config['TATU_SERVER']
        try:
            storage.store(data)
        except DuplicateEntryException:
            print('Duplicate! Ignored.', data.id)
        finally:
            report[file["original_name"]] = "Success!"
            # noinspection PyArgumentList
            post = Post(author=logged_user, data_uuid=data.id, name=name, description=description, number_of_instances=len(
                data.X), number_of_features=len(data.Y))
            # TODO: Inserir as informacoes do dataset no banco de dados. Exemplo post.number_of_instances,
            # post.number_of_features, post.number_of_targets, etc (ver variaveis em models.py class Post)
            for dic in storage.visual_history(data.id, current_app.static_folder):
                db.session.add(Transformation(**dic, post=post))
            db.session.add(post)

    task = Task.query.get(self.request.id)
    task.complete = True
    db.session.commit()

    result = {'current': 100, 'total': 100, 'status': 'done', 'result': report}

    # TODO: retornar para o usuario pelo socketio o result

    socketio.emit('task_done', {'result': result}, room=sid)

    return result


@bp.route('tasks/<string:job_id>/status')
class TasksStatusById(MethodView):
    @jwt_required
    @bp.response(TaskBaseSchema)
    def get(self, job_id):
        # TODO: Access limitations
        task = celery.AsyncResult(job_id)

        if task.state == 'PENDING':
            # job did not start yet
            response = {
                'state': task.state,
                'current': 0,
                'total': 1,
                'status': 'Pending...'
            }
        elif task.state != 'FAILURE':
            response = {
                'state': task.state,
                'current': task.info.get('current', 0),
                'total': task.info.get('total', 1),
                'status': task.info.get('status', '')
            }
            if 'result' in task.info:
                response['result'] = task.info['result']
        else:
            # something went wrong in the background job
            response = {
                'state': task.state,
                'current': 1,
                'total': 1,
                'status': str(task.info),  # this is the exception raised
            }
        return response
