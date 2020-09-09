from app import socketio, db
from flask_socketio import emit
from flask import request
from app.models import User, Session


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
    print(request.sid)


@socketio.on('login')
def login(message):
    print('Client logged')
    logged_user = User.get_by_username(message["username"])
    session = Session(id=request.sid, user=logged_user)
    db.session.add(session)
    db.session.commit()


@socketio.on('disconnect')
def disconnect():
    print('Client disconnected')
    session = Session.query.get(request.sid)
    if session:
        db.session.delete(session)
        db.session.commit()
