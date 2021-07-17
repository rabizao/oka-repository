from app import create_app, db
from app.models import User, Token, Post, Comment, Message, Notification, Task, Download, File
from getpass import getpass

from app.schemas import UserRegisterSchema
from app.utils import consts

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Token': Token, 'Post': Post,
            'Comment': Comment, 'Message': Message,
            'Notification': Notification, 'Task': Task, 'Download': Download, 'File': File}


@app.cli.command("create-admin")
def create_admin():
    username = input("Enter admin username: ")
    password = getpass("Enter admin password: ")
    email = input("Enter your email: ")
    name = input("Enter your name: ")
    data = {
        "username": username,
        "password": password,
        "name": name,
        "email": email
    }
    user_schema = UserRegisterSchema()
    u = user_schema.load(data)
    u.email_confirmed = True
    u.role = consts.get("ROLE_ADMIN")
    db.session.add(u)
    db.session.commit()
