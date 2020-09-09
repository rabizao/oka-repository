from app import create_app, db, socketio
from app.models import User, Token, Post, Comment, Tag, Message, Notification, Task, Session

app = create_app()

if __name__ == '__main__':
    socketio.run(app, debug=True)


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Token': Token, 'Post': Post,
            'Comment': Comment, 'Tag': Tag, 'Message': Message,
            'Notification': Notification, 'Task': Task, 'Session': Session}
