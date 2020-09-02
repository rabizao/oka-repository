from flask_smorest.fields import Upload
from marshmallow import fields, post_load, EXCLUDE, ValidationError, validate
from marshmallow_sqlalchemy import SQLAlchemySchema, SQLAlchemyAutoSchema, auto_field
from marshmallow_sqlalchemy.fields import Nested
from werkzeug.security import generate_password_hash

from app import db
from app.models import User, Post, Comment, Transformation, Contact


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
    replies = Nested("self", many=True, dump_only=True)


class CommentQuerySchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    order_by = fields.String(validate=validate.OneOf(
        ['asc', 'desc']), missing='desc')


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


class TransformationBaseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Transformation

    id = auto_field(dump_only=True)


class PostBaseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Post

    id = auto_field(dump_only=True)
    author = Nested(UserBaseSchema, dump_only=True)
    history = Nested(TransformationBaseSchema, many=True, dump_only=True)
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


class CururuUploadSchema(SQLAlchemySchema):
    # @pre_load  # Diferentes estágios de tratamento dos dados: pre/pos load/dump
    # def test(self, data, **kwargs):
    #     print("test, CururuUploadSchema", data, "----------", kwargs)
    #
    #     return data

    file = Upload()
    json = Upload()


class CururuDownloadSchema(SQLAlchemySchema):
    uuid = fields.String()


class DownloadQuerySchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    uuids = fields.List(fields.String(), required=True)


class ContactBaseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Contact

    id = auto_field(dump_only=True)


class TaskBaseSchema(SQLAlchemySchema):

    state = fields.String()
    current = fields.Integer()
    total = fields.Integer()
    status = fields.String()
