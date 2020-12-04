from app import create_app, db
from app.models import User, Token, Post, Comment, Message, Notification, Task, Download

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Token': Token, 'Post': Post,
            'Comment': Comment, 'Message': Message,
            'Notification': Notification, 'Task': Task, 'Download': Download}
