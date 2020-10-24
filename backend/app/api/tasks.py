import json
import time
import uuid as u
from os import sys
from zipfile import ZipFile

from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_mail import Message
from celery.signals import worker_init

from aiuna.content.root import Root
from aiuna.file import File
from app import celery, create_app, db, mail
from app.models import Post, Task, Transformation, User
from app.schemas import TaskStatusBaseSchema

from . import bp

app = create_app()
app.app_context().push()


class BaseTask(celery.Task):

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        app.logger.error('Unhandled exception', exc_info=sys.exc_info())
        task = Task.query.get(task_id)
        if task:
            task.complete = True
            task.user.add_notification(f'task_progress|{task.id}',
                                       {'task_id': task.id,
                                        'task_name': task.name,
                                        'description': task.description,
                                        'progress': 100,
                                        'state': 'FAILURE',
                                        'status': '{0!r}'.format(exc)
                                        }, overwrite=True)
            db.session.commit()


@worker_init.connect
def configure(sender=None, conf=None, **kwargs):
    conn = celery.connection(transport_options={'visibility_timeout': 0})
    qos = conn.channel().qos
    qos.restore_visible()
    app.logger.info('Unacknowledged messages restored')


def _set_job_progress(job, progress, failure=False, result={}):
    report = json.dumps(result)
    done = True if progress >= 100 else False
    status = 'done' if done else 'processing'
    state = 'SUCCESS' if done else 'PROGRESS'

    meta = {
        'progress': progress,
        'status': status,
    }
    job.update_state(state=state, meta=meta)
    task = Task.query.get(job.request.id)
    if task:
        task.user.add_notification(f'task_progress|{task.id}',
                                   {'task_id': task.id,
                                    'task_name': task.name,
                                    'description': task.description,
                                    'progress': progress,
                                    'state': state,
                                    'status': status,
                                    'result': report
                                    }, overwrite=True)
        if done:
            task.complete = True

        db.session.commit()
    return {'progress': progress, 'status': status, 'state': state, 'result': report}


@celery.task
def send_async_email(message):
    '''
    Background task to send an email
    '''
    msg = Message('[Oka - Contato]', sender=app.config['ADMINS'][0],
                  recipients=[*app.config['ADMINS']])
    msg.html = message

    with app.app_context():
        mail.send(msg)


@celery.task(bind=True, base=BaseTask)
def run_step(self, post_id, step, username):
    '''
    Background task to perform simulations based on step
    '''
    post = Post.query.get(post_id)
    logged_user = User.get_by_username(username)

    # TODO: Perform calculations and update the status using something like
    size = 10
    for i in range(size):
        _set_job_progress(self, i / size * 100)
        time.sleep(5)
    print(post.id, step, logged_user.username)
    result = 'UUID?'
    return _set_job_progress(self, 100, result=result)


@celery.task(bind=True, base=BaseTask)
def download_data(self, uuids):
    '''
    Background task to run async download process
    '''
    # TODO: Check if user has access to files
    storage = app.config['TATU_SERVER']
    filename_server_zip = str(u.uuid4())
    path_server_zip = app.static_folder + '/' + filename_server_zip + '.zip'
    with ZipFile(path_server_zip, 'w') as zipped_file:
        for uuid in uuids:
            actual_index = uuids.index(uuid)
            _set_job_progress(self, actual_index / len(uuids) * 100)
            data = storage.fetch(uuid)
            if data is None:
                raise Exception('Download failed: ' + uuid + ' not found!')
            zipped_file.writestr(
                uuid + '.arff', data.arff('No name', 'No description'))
    result = filename_server_zip + '.zip'
    return _set_job_progress(self, 100, result=result)


@celery.task(bind=True, base=BaseTask)
def process_data(self, files, username):
    '''
    Background task to run async post process
    '''
    logged_user = User.get_by_username(username)
    storage = app.config['TATU_SERVER']
    result = []

    for file in files:
        actual_index = files.index(file)
        _set_job_progress(self, actual_index / len(files) * 100)

        # TODO: remove redundancy
        name = file['path'].split('/')[-1]
        path = '/'.join(file['path'].split('/')[:-1]) + '/'
        f = File(name, path)
        name, description, data = f.dataset, f.description, f.data

        existing_post = logged_user.posts.filter_by(data_uuid=data.id).first()
        if existing_post:
            obj = {'original_name': file['original_name'],
                   'message': 'Error! Dataset already uploaded', 'code': 'error', 'id': existing_post.id}
            result.append(obj)
            logged_user.add_notification(
                name='data_uploaded', data=obj, overwrite=False)
            logged_user.add_notification(
                name='unread_notification_count', data=logged_user.new_notifications(), overwrite=True)
            continue

        storage.store(data)
        post = Post(author=logged_user, data_uuid=data.id, name=name, description=description,
                    number_of_instances=len(data.X), number_of_features=len(data.Y))
        # TODO: Inserir as informacoes do dataset no banco de dados. Exemplo post.number_of_instances,
        # post.number_of_features, post.number_of_targets, etc (ver variaveis em models.py class Post)
        duuid = Root.uuid
        for step in data.history:
            # TODO: stored is useless
            dic = {"label": duuid.id, "name": step.name,
                   "help": str(step), "stored": True}
            db.session.add(Transformation(**dic, post=post))
            duuid *= step.uuid
        # for uid, step in data.history.items():
        #     # TODO: stored is useless
        #     dic = {"label": duuid.id, "name": step["desc"]["name"], "help": str(step), "stored": True}

        #     db.session.add(Transformation(**dic, post=post))
        #     duuid *= UUID(step["id"])
        db.session.add(post)
        db.session.commit()
        obj = {'original_name': file['original_name'],
               'message': 'Dataset successfully uploaded', 'code': 'success', 'id': post.id}
        result.append(obj)
        logged_user.add_notification(
            name='data_uploaded', data=obj, overwrite=False)
        logged_user.add_notification(
            name='unread_notification_count', data=logged_user.new_notifications(), overwrite=True)

    return _set_job_progress(self, 100, result=result)


@bp.route('tasks/<string:task_id>/status')
class TasksStatusById(MethodView):
    @jwt_required
    @bp.response(TaskStatusBaseSchema)
    def get(self, task_id):
        # TODO: Access limitations
        job = celery.AsyncResult(task_id)
        if job.state == 'PENDING':
            # job did not start yet
            response = {
                'state': job.state,
                'progress': 0,
                'status': 'pending'
            }
        elif job.state != 'FAILURE':
            response = {
                'state': job.state,
                'progress': job.info.get('progress', 0),
                'status': job.info.get('status', '')
            }
            if 'result' in job.info:
                response['result'] = job.info['result']
        else:
            # something went wrong in the background job
            response = {
                'state': job.state,
                'progress': 100,
                'status': str(job.info),  # this is the exception raised
            }
        return response
