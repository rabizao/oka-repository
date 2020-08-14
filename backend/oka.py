from app import create_app, db
from app.models import User, Token, Post, Comment, Experiment, Tag, Message, Notification, Task

app = create_app()


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Token': Token, 'Post': Post,
            'Comment': Comment, 'Experiment': Experiment, 'Tag': Tag,
            'Message': Message, 'Notification': Notification, 'Task': Task}
