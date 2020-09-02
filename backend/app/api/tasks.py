from app import mail, celery, db
from . import bp
from app.models import User, Task
from app.schemas import TaskBaseSchema
from flask import current_app, jsonify
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Message
import time


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
def async_job(self, uuid, username):
    """
    Background task to run async jobs
    """
    print("Starting task related to uuid " + uuid + " that belongs to username " + username)

    self.update_state(state='PROGRESS', meta={
                      'current': 25, 'total': 100, 'status': "25 porcento"})
    time.sleep(20)

    self.update_state(state='PROGRESS', meta={
                      'current': 50, 'total': 100, 'status': "50 porcento"})
    time.sleep(20)

    self.update_state(state='PROGRESS', meta={
                      'current': 75, 'total': 100, 'status': "75 porcento"})
    time.sleep(20)

    task = Task.query.get(self.request.id)
    task.complete = True
    db.session.commit()

    return {'current': 100, 'total': 100, 'status': 'done', 'result': "resultado aqui"}


@bp.route('/tasks/<string:uuid>')
class TasksById(MethodView):
    @jwt_required
    @bp.response(code=201)
    def post(self, uuid):
        """ Start a new async job """
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        job = async_job.apply_async(
            [uuid, username])  # passando variavel id {id} e username para o apply_async
        task = Task(id=job.id, name="No name",
                    description="No description", user=logged_user)
        db.session.add(task)
        db.session.commit()
        return jsonify(job_id=job.id)


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
