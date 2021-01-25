from datetime import datetime

from flask import current_app
from flask_smorest.fields import Upload
from marshmallow import fields, post_load, EXCLUDE, ValidationError, validate
from marshmallow_sqlalchemy import SQLAlchemySchema, SQLAlchemyAutoSchema, auto_field
from marshmallow_sqlalchemy.fields import Nested
from werkzeug.security import generate_password_hash

from app import db
from app.models import User, Post, Comment, Contact, Notification, Task, Message
from garoupa.avatar23 import colors


def get_attrs(uuid):
    tatu = current_app.config['TATU_SERVER']
    data = tatu.fetch(uuid, lazy=False)
    return data.Xd if data else {}


def past(uuid):
    tatu = current_app.config['TATU_SERVER']
    data = tatu.fetch(uuid, lazy=False)
    if not data:
        return []  # REMINDER: The history exists, but is not accessible through data.fetch()
    return [
        {"data": v, "post": Post.query.filter_by(data_uuid=k).first().id}
        for k, v in data.past.items() if v["step"]["desc"]["name"][:3] not in ["B", "Rev", "In", "Aut", "E"]
    ]


class UserBaseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        exclude = ["email_confirmation_key", "account_reset_key", "account_reset_key_generation_time",
                   "last_message_read_time", "last_notification_read_time"]

    id = auto_field(dump_only=True)
    username = auto_field(validate=[
        validate.Length(min=6, max=36)])
    password = auto_field(validate=[
        validate.Length(min=6, max=36)], load_only=True)
    email = fields.Email(validate=[
        validate.Length(min=6, max=36)], required=True)
    followed = auto_field(dump_only=True)
    followers = auto_field(dump_only=True)


class CommentBaseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Comment

    id = auto_field(dump_only=True)
    text = auto_field(required=True)
    author = Nested(UserBaseSchema, dump_only=True)
    replies = Nested(lambda: CommentBaseSchema(), many=True, dump_only=True)


class CommentQuerySchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    order_by = fields.String(validate=validate.OneOf(
        ['asc', 'desc']), missing='desc')


class NotificationBaseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Notification

    id = auto_field(dump_only=True)


class NotificationQuerySchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    since = fields.DateTime(missing=datetime(1900, 1, 1))


class UserQuerySchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    name = fields.String()
    email = fields.String()
    username = fields.String()


class UserConfirmationSchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    key = fields.String(required=True)
    confirm = fields.Boolean(missing=True)


class RunSchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    category = fields.String(required=True)
    algorithm = fields.String(required=True)
    parameters = fields.Dict(required=True)


class PostQuerySchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    data_uuid = fields.String()
    name = fields.List(fields.String())
    description = fields.String()
    username = fields.String()
    logic = fields.String()
    # Data attributes
    number_of_features = fields.List(fields.Integer(), validate=[
        validate.Length(equal=2)])
    number_of_targets = fields.List(fields.Integer(), validate=[
        validate.Length(equal=2)])
    number_of_instances = fields.List(fields.Integer(), validate=[
        validate.Length(equal=2)])
    # Tasks
    classification = fields.Boolean()
    regression = fields.Boolean()
    clustering = fields.Boolean()
    other_tasks = fields.Boolean()
    number_of_classes = fields.List(fields.Integer(), validate=[
        validate.Length(equal=2)])
    type_of_regression = fields.String()
    number_of_clusters = fields.List(fields.Integer(), validate=[
        validate.Length(equal=2)])
    # Domain
    life_sciences = fields.Boolean()
    physical_sciences = fields.Boolean()
    engineering = fields.Boolean()
    social = fields.Boolean()
    business = fields.Boolean()
    finances = fields.Boolean()
    astronomy = fields.Boolean()
    quantum_mechanics = fields.Boolean()
    medical = fields.Boolean()
    financial = fields.Boolean()
    other_domains = fields.Boolean()
    # Features
    categorical = fields.Boolean()
    numerical = fields.Boolean()
    text = fields.Boolean()
    images = fields.Boolean()
    time_series = fields.Boolean()
    other_features = fields.Boolean()


class UserRegisterSchema(UserBaseSchema):
    class Meta:
        model = User
        sqla_session = db.session
        load_instance = True

    @post_load
    def check_unique(self, data, **kwargs):
        if User.get_by_username(data["username"]):
            raise ValidationError(field_name='username',
                                  message="Already in use.")
        return data

    @post_load
    def check_unique_email(self, data, **kwargs):
        if User.get_by_email(data["email"]):
            raise ValidationError(field_name='email',
                                  message="Already in use.")
        return data

    @post_load
    def hash_password(self, data, **kwargs):
        data["password"] = generate_password_hash(data["password"])
        return data


class UserLoginSchema(UserBaseSchema):
    class Meta:
        fields = ["username", "password"]

    @post_load
    def check(self, data, **kwargs):
        user = User.get_by_username(data["username"])
        if not user:
            raise ValidationError(field_name="username",
                                  message="Does not exist.")
        if not user.active:
            raise ValidationError(field_name="username",
                                  message="Your account was deleted.")
        if not user.check_password(data["password"]):
            raise ValidationError(field_name="password",
                                  message="Wrong data.")
        return data


class UserRecoverKeySubmitSchema(SQLAlchemySchema):

    email = fields.Email(validate=[
        validate.Length(min=6, max=36)], load_only=True, required=True)


class UserRecoverKeySubmitNewPassSchema(SQLAlchemySchema):
    class Meta:
        model = User

    username = auto_field(validate=[
        validate.Length(min=6, max=36)], required=True)
    password = auto_field(validate=[
        validate.Length(min=6, max=36)], load_only=True, required=True)
    key = auto_field(column_name="account_reset_key", required=True)

    @post_load
    def check(self, data, **kwargs):
        data["password"] = generate_password_hash(data["password"])
        return data


class UserRecoverKeySchema(UserBaseSchema):
    class Meta:
        model = User
        fields = ["email", "username"]

    email = fields.Email(validate=[
        validate.Length(min=6, max=36)], dump_only=True)


class LoginResponseSchema(SQLAlchemySchema):
    access_token = fields.String(dump_only=True)
    refresh_token = fields.String(dump_only=True)
    id = fields.Integer(dump_only=True)
    username = fields.String(dump_only=True)
    name = fields.String(dump_only=True)


class RefreshTokenSchema(SQLAlchemySchema):
    access_token = fields.String(dump_only=True)
    refresh_token = fields.String(load_only=True)


class ApiTokenSchema(SQLAlchemySchema):
    api_token = fields.String(dump_only=True)


class UserEditSchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    name = fields.String(validate=[
        validate.Length(min=1, max=128)])
    password = fields.String(validate=[
        validate.Length(min=6, max=36)], load_only=True)
    about_me = fields.String(validate=[
        validate.Length(max=140)])

    @post_load
    def check(self, data, **kwargs):
        if 'password' in data:
            data["password"] = generate_password_hash(data["password"])

        return data


class MessageBaseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Message

    id = auto_field(dump_only=True)
    author = fields.Nested(UserBaseSchema, dump_only=True)
    recipient = auto_field(dump_only=True)


class MessageListSchema(MessageBaseSchema):
    id = auto_field(dump_only=True)
    body = auto_field(dump_only=True)
    author = fields.Nested(UserBaseSchema, dump_only=True)
    recipient = fields.Nested(UserBaseSchema, dump_only=True)


class PostBaseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Post

    id = auto_field(dump_only=True)
    author = Nested(UserBaseSchema, dump_only=True)
    comments = auto_field(dump_only=True)
    allowed = fields.Pluck(UserBaseSchema, "username",
                           many=True, dump_only=True)
    favorites = auto_field(dump_only=True)
    data_uuid_colors = fields.Function(
        lambda obj: colors(obj.data_uuid), dump_only=True)
    attrs = fields.Function(lambda obj: get_attrs(
        obj.data_uuid), dump_only=True)
    history = fields.Function(lambda obj: past(obj.data_uuid), dump_only=True)
    downloads = fields.Function(
        lambda obj: obj.get_unique_download_count(), dump_only=True)


class PostEditSchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    name = fields.String(validate=[
        validate.Length(min=1, max=120)])
    description = fields.String(validate=[
        validate.Length(min=1, max=100000)])


class PostCreateSchema(SQLAlchemySchema):
    data_uuid = fields.String(required=True)
    info = fields.Dict(required=True)
    name = fields.String(missing="No name")
    description = fields.String(missing="No description")


class PostFilesSchema(SQLAlchemySchema):
    files = fields.List(Upload(), required=True)


class PostActivateSchema(SQLAlchemySchema):
    data_uuid = fields.String(required=True)


class SyncCheckBaseSchema(SQLAlchemySchema):
    uuids = fields.List(fields.String(), required=True)
    cat = fields.String(required=True)
    empty = fields.Boolean(missing=True)
    # names = fields.List(fields.String())
    fetch = fields.Boolean(missing=False)


class SyncCheckResponseSchema(SQLAlchemySchema):
    uuids = fields.Dict(dump_only=True)


class SyncPostSchema(SQLAlchemySchema):
    kwargs = fields.Dict(required=True)


class SyncPostQuerySchema(SQLAlchemySchema):
    cat = fields.String(required=True)


class SyncResponseSchema(SQLAlchemySchema):
    uuid = fields.String(dump_only=True)


class SyncContentFileSchema(SQLAlchemySchema):
    bina = Upload(required=True)


class SyncFieldsSchema(SQLAlchemySchema):
    rows = fields.List(fields.Tuple(
        (fields.String(), fields.String(), fields.String())), required=True)


class SyncFieldsQuerySchema(SQLAlchemySchema):
    ignoredup = fields.Bool(missing=False)
    cat = fields.String(required=True)


class SyncContentQuerySchema(SQLAlchemySchema):
    ignoredup = fields.Bool(missing=False)


class SuccessResponseSchema(SQLAlchemySchema):
    success = fields.Bool()


class NumberResponseSchema(SQLAlchemySchema):
    n = fields.Integer()


class SyncContentSchema(SQLAlchemySchema):
    # uuid = fields.List(fields.String())
    uuid = fields.String()


class DownloadQuerySchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    pids = fields.List(fields.String(), required=True)


class DownloadFileByNameQuerySchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    name = fields.String(required=True)


class StatsQuerySchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    x = fields.Integer(missing=0)
    y = fields.Integer(missing=0)
    plt = fields.String(required=True)


class ContactBaseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Contact

    id = auto_field(dump_only=True)


class TaskBaseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Task

    id = auto_field(dump_only=True)


class TaskStatusBaseSchema(SQLAlchemySchema):
    state = fields.String()
    progress = fields.Integer()
    status = fields.String()
    result = fields.String()
