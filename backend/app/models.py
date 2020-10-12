from sqlalchemy import or_, and_, asc
from datetime import datetime
from werkzeug.security import check_password_hash
from app import db
# from tatu.persistence import DuplicateEntryException
# from aiuna.data import Data
# from flask import current_app
import json
from time import time

# import redis
# import rq


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
        logic = data['logic'] if 'logic' in data else 'or'
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
            else:
                search_conds += [getattr(cls, key).like(f"%{values}%")]
        if logic == "or":
            resources = query.filter_by(**filter_by).filter(
                or_(*search_conds)).filter(*filter).order_by(order_by).paginate(page, page_size, False)
        else:
            resources = query.filter_by(**filter_by).filter(
                and_(*search_conds)).filter(*filter).order_by(order_by).paginate(page, page_size, False)
        return resources.items, resources.total


class User(PaginateMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True,
                         unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(120), index=True,
                      unique=True, nullable=False)
    name = db.Column(db.String(128), nullable=False)
    about_me = db.Column(db.String(140))
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    last_message_read_time = db.Column(db.DateTime)
    active = db.Column(db.Boolean, default=True)
    role = db.Column(db.Integer, default=0)

    posts = db.relationship('Post', backref='author', lazy='dynamic')
    comments = db.relationship('Comment', backref='author', lazy='dynamic')
    tags = db.relationship('Tag', backref='author', lazy='dynamic')
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
        return self.role == 10

    def update(self, args):
        for key, value in args.items():
            setattr(self, key, value)
        return self

    # def new_messages(self):
    #     last_read_time = self.last_message_read_time or datetime(1900, 1, 1)
    #     return Message.query.filter_by(recipient=self).filter(
    #         Message.timestamp > last_read_time).count()

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
            followers.c.follower_id == self.id, Post.public is True)
        own = Post.query.filter_by(user_id=self.id)
        return followed.union(own).order_by(Post.timestamp.desc())

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
            access.c.post_id == post.id).count() > 0 or post.author == self

    def accessible_posts(self):
        can_see = self.accessible.filter(Post.active is True)
        own = Post.query.filter_by(user_id=self.id)
        return can_see.union(own)
        # return self.accessible.filter(access.c.post_id == post.id).all() and self.posts

    # def launch_task(self, name, description, *args, **kwargs):
    #     rq_job = current_app.task_queue.enqueue('current_app.tasks.' + name, self.id,
    #                                             *args, **kwargs)
    #     task = Task(id=rq_job.get_id(), name=name, description=description,
    #                 user=self)
    #     db.session.add(task)
    #     return task

    # def get_tasks_in_progress(self):
    #     return Task.query.filter_by(user=self, complete=False).all()

    # def get_task_in_progress(self, name):
    #     return Task.query.filter_by(name=name, user=self,
    #                                 complete=False).first()

    @staticmethod
    def list_by_name(search_term):
        return User.query.filter(User.username.like("%{}%".format(search_term))).all()

    @staticmethod
    def get_by_username(username):
        return User.query.filter_by(username=username).first()

    @staticmethod
    def get_by_email(email):
        return User.query.filter_by(email=email).first()

    def __repr__(self):
        return '<User {}>'.format(self.username)


class Transformation(db.Model):
    # "label" "name" "help" "stored" "avatar"
    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(999))  # Visible text describind Data object.
    name = db.Column(db.String(999))  # Name of the Transformer object.
    # Complete description of the Transformer object.
    help = db.Column(db.Text)
    # Whether the Data object is already stored in tatu.
    stored = db.Column(db.Boolean)
    # Filename of the icon representing the Data object.
    avatar = db.Column(db.String(999))
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'))


class Post(PaginateMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # Unique
    data_uuid = db.Column(db.String(120), index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    __table_args__ = (db.UniqueConstraint(
        'data_uuid', 'user_id', name='_data_user_unique'),)

    name = db.Column(db.String(120), default="No name")
    description = db.Column(db.Text, default="No description")
    # avatar = db.Column(db.String(1000))

    downloads = db.Column(db.Integer(), default=0)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    publish_timestamp = db.Column(db.DateTime, index=True)
    comments = db.relationship('Comment', backref='post', lazy='dynamic')
    history = db.relationship(
        'Transformation', backref='post', lazy='dynamic', order_by=asc(Transformation.id))
    tags = db.relationship('Tag', backref='post', lazy='dynamic')
    public = db.Column(db.Boolean, default=False)
    active = db.Column(db.Boolean, default=True)
    # Data attributes
    number_of_features = db.Column(db.Integer)
    number_of_targets = db.Column(db.Integer)
    number_of_instances = db.Column(db.Integer)
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

    # def add_tag(self, text, author):
    #     tag = Tag(text=text, post=self, author=author)
    #     db.session.commit()
    #     return tag

    # def show_tags(self):
    #     return self.tags.all()

    # def store(self):
    #     db.session.add(self)
    #     db.session.commit()

    # def delete(self):  # TODO delete dataset
    #     db.session.delete(self)
    #     db.session.commit()
    #     return

    # def is_public(self):
    #     return self.public

    # def is_private(self):
    #     return not self.public

    # def set_public(self):
    #     self.public = True
    #     db.session.commit()

    # def set_private(self):
    #     self.public = False
    #     db.session.commit()

    def can_be_shown_to(self, user):
        return self.is_public() or self.author == user

    def update(self, args):
        for key, value in args.items():
            setattr(self, key, value)
        return self

    # @staticmethod
    # def new(data, author, name):
    #     storage = current_app.config['TATU_SERVER']
    #  try:
    #         PickleServer().store(data)
    #         try:
    #             post = Post(data_uuid=data.uuid, author=author, name=name)
    #             post.store()
    #             return 'Dataset stored!'
    #         except DuplicateEntryException:
    #             return 'Duplicated dataset! Ignored.'
    #     except DuplicateEntryException:
    #         return 'Duplicated dataset! Ignored.'

    # def get_comments(self):
    #     return self.comments.order_by(Comment.timestamp.desc())

    # def get_data_object(self):
    #     storage = current_app.config['TATU_SERVER']
    #     return PickleServer().fetch(Data.phantom_by_uuid(self.data_uuid))

    @staticmethod
    def get_by_uuid(uuid, active=False):
        if active:
            return Post.query.filter_by(data_uuid=uuid, active=True).all()
        else:
            return Post.query.filter_by(data_uuid=uuid).all()

    def __repr__(self):
        return '<Post {}>'.format(self.id)


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


class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    text = db.Column(db.String(140))
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    @staticmethod
    def list_datasets_by_tag(search_term):
        tags = Tag.query.filter(Tag.text.like(
            "%{}%".format(search_term))).all()
        datasets = [p.post.get_data_object() for p in tags]
        return datasets


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    body = db.Column(db.String(140))
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)

    def __repr__(self):
        return '<Message {}>'.format(self.body)


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    timestamp = db.Column(db.Float, index=True, default=time)
    payload_json = db.Column(db.Text)

    def get_data(self):
        return json.loads(str(self.payload_json))


class Task(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(128), index=True)
    description = db.Column(db.String(128))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    complete = db.Column(db.Boolean, default=False)

    # def get_rq_job(self):
    #     try:
    #         rq_job = rq.job.Job.fetch(self.id, connection=current_app.redis)
    #     except (redis.exceptions.RedisError, rq.exceptions.NoSuchJobError):
    #         return None
    #     return rq_job

    # def get_progress(self):
    #     job = self.get_rq_job()
    #     return job.meta.get('progress', 0) if job is not None else 100


class Token(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(120), index=True, unique=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    revoked = db.Column(db.Boolean)
    long_term = db.Column(db.Boolean)

    @classmethod
    def is_jti_blacklisted(cls, jti):
        token = cls.query.filter_by(jti=jti).first()
        if token is None or token.revoked is True:
            return True
        return False


class Contact(PaginateMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(140))
    email = db.Column(db.String(140))
    message = db.Column(db.Text())
    active = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return '<Contact {}>'.format(self.id)
