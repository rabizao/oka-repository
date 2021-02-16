import json
import uuid as u
from datetime import datetime
from flask.globals import current_app

from sqlalchemy import and_, or_
from werkzeug.security import check_password_hash

from . import celery, db
from app.utils import consts


followers = db.Table('followers',
                     db.Column('follower_id', db.Integer,
                               db.ForeignKey('user.id')),
                     db.Column('followed_id', db.Integer,
                               db.ForeignKey('user.id'))
                     )

favorites = db.Table('favorites',
                     db.Column('user_id', db.Integer,
                               db.ForeignKey('user.id')),
                     db.Column('post_id', db.Integer,
                               db.ForeignKey('post.id')),
                     db.Column('timestamp', db.DateTime,
                               default=datetime.utcnow)
                     )

access = db.Table('access',
                  db.Column('user_id', db.Integer,
                            db.ForeignKey('user.id')),
                  db.Column('post_id', db.Integer,
                            db.ForeignKey('post.id')),
                  db.Column('timestamp', db.DateTime,
                            default=datetime.utcnow)
                  )


class PaginateMixin(object):
    @classmethod
    def get(cls, data, page, page_size, query=None, filter_by={"active": True}, filter=[], order_by=None):
        """
        Return a collection of items already paginated of the selected class
        """
        logic = and_ if 'logic' in data and data['logic'] == 'and' else or_
        query = query or cls.query
        data.pop('logic', None)
        search_conds = []
        for key, values in data.items():
            if isinstance(values, list):
                if len(values) == 2 and all(isinstance(item, int) for item in values):
                    values.sort()
                    search_conds += [getattr(cls, key).between(*values)]
                else:
                    search_conds += [getattr(cls,
                                             key).like(f"%{item}%") for item in values]
            elif isinstance(values, bool):
                search_conds += [getattr(cls, key).is_(values)]
            else:
                search_conds += [getattr(cls, key).like(f"%{values}%")]

        resources = query.filter_by(**filter_by).filter(
            logic(*search_conds)).filter(*filter).order_by(order_by).paginate(page, page_size, False)

        return resources.items, resources.total


class User(PaginateMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True,
                         unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(120), index=True,
                      nullable=False)
    email_confirmation_key = db.Column(db.String(120))
    account_reset_key = db.Column(db.String(120))
    account_reset_key_generation_time = db.Column(
        db.DateTime, default=datetime.utcnow)
    email_confirmed = db.Column(db.Boolean, default=False)
    name = db.Column(db.String(128), nullable=False)
    about_me = db.Column(db.String(140))
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    last_message_read_time = db.Column(db.DateTime)
    last_notification_read_time = db.Column(db.DateTime)
    active = db.Column(db.Boolean, default=True)
    role = db.Column(db.Integer, default=0)
    files = db.relationship('File', backref='owner', lazy='dynamic')

    posts = db.relationship('Post', backref='author', lazy='dynamic')
    comments = db.relationship('Comment', backref='author', lazy='dynamic')
    tasks = db.relationship('Task', backref='user', lazy='dynamic')
    tokens = db.relationship('Token', backref='owner', lazy='dynamic')
    messages_sent = db.relationship('Message',
                                    foreign_keys='Message.sender_id',
                                    backref='author', lazy='dynamic')
    messages_received = db.relationship('Message',
                                        foreign_keys='Message.recipient_id',
                                        backref='recipient', lazy='dynamic')

    notifications = db.relationship('Notification', backref='user',
                                    lazy='dynamic')

    followed = db.relationship(
        'User', secondary=followers,
        primaryjoin=(followers.c.follower_id == id),
        secondaryjoin=(followers.c.followed_id == id),
        backref=db.backref('followers', lazy='dynamic'), lazy='dynamic')

    favorited = db.relationship(
        'Post', secondary=favorites,
        backref=db.backref('favorites', lazy='dynamic'), lazy='dynamic')

    # user.accessible
    # post.allowed
    accessible = db.relationship(
        'Post', secondary=access,
        backref=db.backref('allowed', lazy='dynamic'), lazy='dynamic')

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def add_confirmation_key(self):
        key = str(u.uuid4())
        self.email_confirmation_key = key
        return key

    def set_revoked_jti_store(self, jti, state, long_term=False):
        if long_term is True:
            self.revoke_longterm_token()
        token = self.tokens.filter_by(jti=jti).first()
        if token:
            token.revoked = state
        else:
            new_token = Token(owner=self, jti=jti,
                              revoked=state, long_term=long_term)
            db.session.add(new_token)
        db.session.commit()
        return

    def revoke_longterm_token(self):
        token = self.tokens.filter_by(long_term=True).first()
        if token:
            token.revoked = True
            db.session.commit()
        return

    def revoke_all_tokens(self):
        for token in self.tokens:
            token.revoked = True
        db.session.commit()
        return

    def is_admin(self):
        return self.role == consts.get("ROLE_ADMIN")

    def update(self, args):
        for key, value in args.items():
            setattr(self, key, value)
        return self

    def new_messages(self):
        last_read_time = self.last_message_read_time or datetime(1900, 1, 1)
        return Message.query.filter_by(recipient=self).filter(
            Message.timestamp > last_read_time).count()

    def new_notifications(self):
        countable = ["data_uploaded"]
        last_read_time = self.last_notification_read_time or datetime(
            1900, 1, 1)
        return Notification.query.filter(
            or_(*[Notification.name.like(n) for n in countable])).filter(
            Notification.timestamp > last_read_time).count()

    def add_notification(self, name, data, overwrite=False):
        if overwrite:
            self.notifications.filter_by(name=name).delete()
        n = Notification(name=name, payload_json=json.dumps(data), user=self)
        db.session.add(n)
        return n

    def follow(self, user):
        if not self.is_following(user):
            self.followed.append(user)

    def unfollow(self, user):
        if self.is_following(user):
            self.followed.remove(user)

    def is_following(self, user):
        return self.followed.filter(
            followers.c.followed_id == user.id).count() > 0

    def followed_posts(self):  # feed
        followed = Post.query.join(
            followers, (followers.c.followed_id == Post.user_id)).filter(
            followers.c.follower_id == self.id, Post.public)
        own = Post.query.filter_by(user_id=self.id)
        return followed.union(own)

    def favorite(self, post):
        if not self.has_favorited(post):
            self.favorited.append(post)
            db.session.commit()

    def unfavorite(self, post):
        if self.has_favorited(post):
            self.favorited.remove(post)
            db.session.commit()

    def has_favorited(self, post):
        return self.favorited.filter(
            favorites.c.post_id == post.id).count() > 0

    def favorited_posts(self):
        return self.favorited.order_by(favorites.c.timestamp.desc()).all()

    def has_access(self, post):
        return self.accessible.filter(
            access.c.post_id == post.id).count() > 0 or post.author == self or post.public is True

    def grant_access(self, post):
        if not self.has_access(post):
            self.accessible.append(post)

    def deny_access(self, post):
        if self.has_access(post):
            self.accessible.remove(post)

    def accessible_posts(self):
        can_see = self.accessible.filter(Post.active)
        own = Post.query.filter_by(user_id=self.id, active=True)
        public = Post.query.filter_by(public=True)
        return can_see.union(own).union(public)
        # return self.accessible.filter(access.c.post_id == post.id).all() and self.posts

    def accessible_twin_posts(self, post):
        can_see = self.accessible.filter(Post.active)
        own = Post.query.filter_by(user_id=self.id, active=True)
        return can_see.union(own).filter_by(data_uuid=post.data_uuid).filter(Post.id != post.id)

    def launch_task(self, name, description, *args, **kwargs):
        job = celery.send_task('app.api.tasks.' + name, *args, **kwargs)
        task = Task(id=job.id, name=name, description=description,
                    user=self)
        db.session.add(task)
        return task

    def add_file(self, name):
        file = File(owner=self, name=name)
        db.session.add(file)
        return file

    def can_download(self, file):
        return self.files.filter(file.owner == self).count() > 0

    def get_file_by_name(self, name):
        return self.files.filter(File.name == name).first()

    def account_reset_key_expired(self):
        return self.account_reset_key_generation_time \
            + current_app.config['RESET_ACCOUNT_KEY_EXPIRES'] < datetime.utcnow()

    def add_reset_key(self):
        key = str(u.uuid4())
        self.account_reset_key = key
        self.account_reset_key_generation_time = datetime.utcnow()
        return key

    @staticmethod
    def list_by_name(search_term):
        return User.query.filter(User.username.like("%{}%".format(search_term))).all()

    @staticmethod
    def get_by_username(username):
        return User.query.filter_by(username=username).first()

    @staticmethod
    def get_by_email(email):
        return User.query.filter_by(email=email).first()

    @staticmethod
    def get_by_confirmed_email(email):
        return User.query.filter_by(email=email, email_confirmed=True).first()

    def __repr__(self):
        return '<User {}>'.format(self.username)


class Post(PaginateMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data_uuid = db.Column(db.String(120), index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    __table_args__ = (db.UniqueConstraint(
        'data_uuid', 'user_id', name='_data_user_unique'),)

    name = db.Column(db.String(120), default="No name")
    description = db.Column(db.Text, default="No description")

    downloads = db.relationship('Download', backref='post', lazy='dynamic')
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    publish_timestamp = db.Column(db.DateTime, index=True)
    comments = db.relationship('Comment', backref='post', lazy='dynamic')
    public = db.Column(db.Boolean, default=False)
    active = db.Column(db.Boolean, default=True)
    # Data attributes
    number_of_features = db.Column(db.Integer)
    number_of_targets = db.Column(db.Integer)
    number_of_instances = db.Column(db.Integer)
    number_of_classes = db.Column(db.Integer)
    # Tasks
    classification = db.Column(db.Boolean)
    regression = db.Column(db.Boolean)
    clustering = db.Column(db.Boolean)
    other_tasks = db.Column(db.Boolean)
    number_of_classes = db.Column(db.Integer)
    type_of_regression = db.Column(db.Integer)
    number_of_clusters = db.Column(db.Integer)
    # Domain
    life_sciences = db.Column(db.Boolean)
    physical_sciences = db.Column(db.Boolean)
    engineering = db.Column(db.Boolean)
    social = db.Column(db.Boolean)
    business = db.Column(db.Boolean)
    finances = db.Column(db.Boolean)
    astronomy = db.Column(db.Boolean)
    quantum_mechanics = db.Column(db.Boolean)
    medical = db.Column(db.Boolean)
    financial = db.Column(db.Boolean)
    other_domains = db.Column(db.Boolean)
    # Features
    categorical = db.Column(db.Boolean)
    numerical = db.Column(db.Boolean)
    text = db.Column(db.Boolean)
    images = db.Column(db.Boolean)
    time_series = db.Column(db.Boolean)
    other_features = db.Column(db.Boolean)

    def add_comment(self, text, author):
        comment = Comment(text=text, post=self, author=author)
        db.session.add(comment)
        db.session.commit()
        return comment

    def add_download(self, ip):
        download = Download(post=self, ip=ip)
        db.session.add(download)
        return download

    def update(self, args):
        for key, value in args.items():
            setattr(self, key, value)
        return self

    def get_unique_download_count(self):
        return db.session.query(Download.ip).distinct().filter_by(post_id=self.id).count()

    @staticmethod
    def get_by_uuid(uuid, active=False):
        if active:
            return Post.query.filter_by(data_uuid=uuid, active=True).all()
        else:
            return Post.query.filter_by(data_uuid=uuid).all()


class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(140))
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    timestamp = db.Column(db.DateTime(), default=datetime.utcnow, index=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('comment.id'))
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    replies = db.relationship(
        'Comment', backref=db.backref('parent', remote_side=[id]),
        lazy='dynamic')
    active = db.Column(db.Boolean, default=True)

    def add_reply(self, text, author):
        reply = Comment(text=text, parent=self, author=author)
        db.session.add(reply)
        db.session.commit()
        return reply


class Download(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip = db.Column(db.String(140))
    timestamp = db.Column(db.DateTime(), default=datetime.utcnow, index=True)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'))


class Message(db.Model, PaginateMixin):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    body = db.Column(db.String(140), nullable=False)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    active = db.Column(db.Boolean, default=True)


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    payload_json = db.Column(db.Text)
    active = db.Column(db.Boolean, default=True)

    def get_data(self):
        return json.loads(str(self.payload_json))


class Task(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(128), index=True)
    description = db.Column(db.String(128))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    complete = db.Column(db.Boolean, default=False)
    active = db.Column(db.Boolean, default=True)


class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), index=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'))


class Token(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(120), index=True, unique=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    revoked = db.Column(db.Boolean)
    long_term = db.Column(db.Boolean)

    @staticmethod
    def is_jti_blacklisted(jti):
        token = Token.query.filter_by(jti=jti).first()
        if token is None or token.revoked is True:
            return True
        return False


class Contact(PaginateMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(140))
    email = db.Column(db.String(140))
    message = db.Column(db.String(600), nullable=False)
    active = db.Column(db.Boolean, default=True)
