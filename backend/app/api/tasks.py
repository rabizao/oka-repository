import json
# import time
import uuid as u
from os import sys
from zipfile import ZipFile

from aiuna.content.data import Data
from aiuna.step.file import File
from akangatu.transf.step import Step
from app import celery, db, mail
from app.models import Post, Task, User
from app.schemas import TaskStatusBaseSchema
from celery.signals import worker_init
from flask import current_app
from flask.views import MethodView
from flask_mail import Message

from . import bp


# def create_post(logged_user, data, name="No name",
# description="No description", filename=None, active=True, info=None):
def create_post(logged_user, data, name, description, filename=None, active=True, info=None, notify=True):
    """Create an inactive post for the given Data object or data id str."""
    if info is None:
        info = {
            "nattrs": data.X.shape[1],
            "ninsts": data.X.shape[0],
            "ntargs": data.Y.shape[1] if len(data.Y.shape) > 1 else 1,
            "nclasses": len(set(data.y)),
            "past": list(data.past)}
    data_id = data.id if isinstance(data, Data) else data
    if filename is None:
        filename = name
    existing_post = logged_user.posts.filter_by(data_uuid=data_id).first()
    if existing_post:
        # Choose message when the post already exists.
        if existing_post.active or not active:
            obj = {
                'original_name': filename,
                'message': 'Error! Dataset already uploaded',
                'code': 'error',
                'id': existing_post.id
            }
        else:
            existing_post.active = True
            db.session.commit()
            obj = {
                'original_name': filename,
                'message': 'Post successfully restored',
                'code': 'success',
                'id': existing_post.id
            }
        logged_user.add_notification(
            name='data_uploaded', data=obj, overwrite=False)
        logged_user.add_notification(
            name='unread_notification_count', data=logged_user.new_notifications(), overwrite=True
        )
    else:
        # Defaults for ancestors.
        name_, description_, ninsts_, nattrs_, ntargs_, nclasses_ = "No name", "No description", -1, -1, -1, -1

        # Create post and needed ancestors.
        for did in info["past"][1:]:
            if did == data_id:
                # Only the last Data object has metainfo.
                name_, description_, ninsts_, nattrs_, ntargs_, nclasses_ = name, description, info[
                    "ninsts"], info["nattrs"], info["ntargs"], info["nclasses"]
            existing_post = logged_user.posts.filter_by(data_uuid=did).first()
            if not existing_post:
                # noinspection PyArgumentList
                post = Post(
                    author=logged_user,
                    data_uuid=did,
                    name=name_,
                    description=description_,
                    number_of_instances=ninsts_,
                    number_of_features=nattrs_,
                    number_of_targets=ntargs_,
                    number_of_classes=nclasses_,
                    active=active
                )
                # TODO: Inserir as informacoes do dataset no banco de dados. Exemplo post.number_of_instances,
                # post.number_of_features, post.number_of_targets, etc (ver variaveis em models.py class Post)
                db.session.add(post)
        db.session.commit()

        obj = {
            'original_name': filename,
            'message': 'Post successfully created',
            'code': 'success',
            'id': post.id
        }
        logged_user.add_notification(
            name='data_uploaded', data=obj, overwrite=False)
        logged_user.add_notification(
            name='unread_notification_count',
            data=logged_user.new_notifications(),
            overwrite=True
        )

    return obj


class BaseTask(celery.Task):

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        current_app.logger.error(
            'Unhandled exception', exc_info=sys.exc_info())
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
    current_app.logger.info('Unacknowledged messages restored')


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

    if job.request.id:
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
    msg = Message('[Oka - Contato]', sender=current_app.config['ADMINS'][0],
                  recipients=[*current_app.config['ADMINS']])
    msg.html = message

    with current_app.app_context():
        mail.send(msg)


@celery.task(bind=True, base=BaseTask)
def run_step(self, post_id, step_asdict, username):
    '''
    Background task to perform simulations based on step
    '''
    post = Post.query.get(post_id)
    logged_user = User.get_by_username(username)
    tatu = current_app.config['TATU_SERVER']()

    step = Step.fromdict(step_asdict)

    _set_job_progress(self, 0)
    data = tatu.fetch(post.data_uuid, lazy=False) >> step
    tatu.store(data)

    # minhas mudanças antes de dar pull no dev do rabizao ==============
    # tatu.store(data, lazy=False, ignoredup=True)
    # result = create_post(logged_user, data)
    # ==================================================================

    # TODO: vai precisar criar post pras partições? (nessa função?) onde?

    name = f"{post.name}->{step_asdict['desc']['path']}"
    description = f"Dataset generated by applying {step_asdict['desc']['path']} " \
                  f"to {post.name} with config {step_asdict['desc']['config']}"

    result = create_post(logged_user, data, name, description, notify=False)
    tatu.close()
    return _set_job_progress(self, 100, result=result)


@celery.task(bind=True, base=BaseTask)
def download_data(self, pids, username, ip):
    '''
    Background task to run async download process
    '''
    # TODO: Check if user has access to files
    logged_user = User.get_by_username(username)
    if not logged_user:
        raise Exception(f'Username {username} not found!')
    tatu = current_app.config['TATU_SERVER']()
    filename_server_zip = str(u.uuid4()) + '.zip'
    path_server_zip = f'{current_app.config["TMP_FOLDER"]}/{filename_server_zip}'
    with ZipFile(path_server_zip, 'w') as zipped_file:
        for pid in pids:
            actual_index = pids.index(pid)
            _set_job_progress(self, actual_index / len(pids) * 100)
            post = Post.query.get(pid)
            if not post:
                tatu.close()
                raise Exception(f'Download failed: post {pid} not found!')
            if not logged_user.has_access(post):
                tatu.close()
                raise Exception(
                    f'Download failed. You do not have access to post {pid}!')
            data = tatu.fetch(post.data_uuid, lazy=False)
            if data is None:
                tatu.close()
                raise Exception(
                    f'Download failed: data {post.data_uuid} not found!')
            post.add_download(ip)
            logged_user.add_file(filename_server_zip)
            db.session.commit()
            zipped_file.writestr(f'{pid}.arff', data.arff(
                'No name', 'No description'))
            if data.hasstream:
                datas = tatu.fetchstream(post.data_uuid, lazy=False)
                for i, dat in enumerate(datas):
                    # zipped_file.writestr(f'{pid}-{i}-train.arff', dat.inner.arff('No name', 'No description'))
                    zipped_file.writestr(f'{pid}-{i}-test.arff', dat.arff('No name', 'No description'))
        zipped_file.close()
    tatu.close()
    return _set_job_progress(self, 100, result=f'{filename_server_zip}')


@celery.task(bind=True, base=BaseTask)
def process_file(self, files, username):
    '''
    Background task to run async post process
    '''
    logged_user = User.get_by_username(username)
    if not logged_user:
        raise Exception(f'Username {username} not found!')
    result = []
    tatu = current_app.config['TATU_SERVER']()

    for file in files:
        actual_index = files.index(file)
        _set_job_progress(self, actual_index / len(files) * 100)

        # TODO: remove redundancy
        name = file['path'].split('/')[-1]
        path = '/'.join(file['path'].split('/')[:-1]) + '/'
        f = File(name, path)
        name, description = f.dataset, f.description
        tatu.store(f.data, lazy=False, ignoredup=True)
        result.append(create_post(logged_user, f.data, name,
                                  description, file['original_name']))

    tatu.close()
    return _set_job_progress(self, 100, result=result)


@bp.route('tasks/<string:task_id>/status')
class TasksStatusById(MethodView):
    @bp.auth_required
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
