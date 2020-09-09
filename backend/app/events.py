from app import socketio
from flask_socketio import emit


@socketio.on('task_done')
def task_done(message):
    print("event disparado", message['data'])


@socketio.on('my_broadcast_event')
def broadcast_message(message):
    print("broadcast disparado")
    emit('my response', {'data': message['data']}, broadcast=True)


@socketio.on('connect')
def connect():
    print('Client connected')


@socketio.on('disconnect')
def disconnect():
    print('Client disconnected')
