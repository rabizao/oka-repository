from app import socketio
from flask_socketio import emit


@socketio.on('my_event')
def test_message(message):
    print("event disparado", message['data'])


@socketio.on('my_broadcast_event')
def broadcast_message(message):
    print("broadcast disparado")
    emit('my response', {'data': message['data']}, broadcast=True)


@socketio.on('connect')
def test_connect():
    print('Client connected')
    emit('my response', {'data': 'Connected'})


@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')
