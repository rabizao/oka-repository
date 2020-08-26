from marshmallow_sqlalchemy import SQLAlchemySchema, SQLAlchemyAutoSchema, auto_field
from marshmallow_sqlalchemy.fields import Nested
from app import db
from marshmallow import fields, post_load, EXCLUDE, ValidationError, validate
from werkzeug.security import generate_password_hash
from app.models import User, Post, Experiment, Comment
from flask_smorest.fields import Upload


class UserBaseSchema(SQLAlchemyAutoSchema):

    class Meta:
        model = User

    id = auto_field(dump_only=True)
    username = auto_field(validate=[
        validate.Length(min=6, max=36)])
    password = auto_field(validate=[
        validate.Length(min=6, max=36)], load_only=True)
    email = fields.Email(validate=[
        validate.Length(min=6, max=36)], load_only=True, required=True)
    followed = fields.Pluck("self", "id", many=True, dump_only=True)
    followers = fields.Pluck("self", "id", many=True, dump_only=True)


class CommentBaseSchema(SQLAlchemyAutoSchema):

    class Meta:
        model = Comment

    id = auto_field(dump_only=True)
    text = auto_field(required=True)
    author = Nested(UserBaseSchema, dump_only=True)
    replies = Nested("self", dump_only=True)


class UserQuerySchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    name = fields.String()
    email = fields.String()
    username = fields.String()


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
        fields = ("username", "password")

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
        validate.Length(min=1, max=140)])
    email = fields.Email(validate=[
        validate.Length(min=6, max=36)])

    @post_load
    def check(self, data, **kwargs):
        if 'email' in data:
            if User.get_by_email(data["email"]):
                raise ValidationError(field_name='email',
                                      message="Already in use.")
        if 'password' in data:
            data["password"] = generate_password_hash(data["password"])

        return data


class PostBaseSchema(SQLAlchemyAutoSchema):

    class Meta:
        model = Post

    id = auto_field(dump_only=True)
    author = Nested(UserBaseSchema, dump_only=True)
    favorites = fields.Pluck(UserBaseSchema, "id", many=True, dump_only=True)


class PostEditSchema(SQLAlchemySchema):

    class Meta:
        unknown = EXCLUDE

    name = fields.String(validate=[
        validate.Length(min=1, max=120)])
    description = fields.String(validate=[
        validate.Length(min=1, max=100000)])


class PostFilesSchema(SQLAlchemySchema):

    files = fields.List(Upload())


class ExperimentBaseSchema(SQLAlchemyAutoSchema):

    class Meta:
        model = Experiment

    id = auto_field(dump_only=True)
    author = Nested(UserBaseSchema, dump_only=True)


class ExperimentQuerySchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    experiment_uuid = fields.String()
    name = fields.String()
    description = fields.String()


class ExperimentRegisterSchema(ExperimentBaseSchema):

    @post_load
    def check_unique(self, data, **kwargs):
        if Experiment.get_by_uuid(data["experiment_uuid"]):
            raise ValidationError(field_name='experiment_uuid',
                                  message="Already in use.")
        return data


class DownloadQuerySchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    uuids = fields.List(fields.String(), required=True)
