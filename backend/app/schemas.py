from marshmallow_sqlalchemy import SQLAlchemySchema, SQLAlchemyAutoSchema, auto_field
from marshmallow_sqlalchemy.fields import Nested
from app import db
# from app.models import Job, Tag
from marshmallow import fields, post_load, EXCLUDE, ValidationError, validate
from werkzeug.security import generate_password_hash
from app.models import User, Post, Experiment


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


class ParseQueryMixin(object):
    @post_load
    def parse_search_list(self, data, **kwargs):
        for key, value in data.items():
            data[key] = data[key].split(',')
        return data


class UserQuerySchema(ParseQueryMixin, SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    name = fields.String()
    email = fields.String()
    username = fields.String()


class PostQuerySchema(ParseQueryMixin, SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    data_uuid = fields.String()
    name = fields.String()
    body = fields.String()
    username = fields.String()


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


class RefreshTokenSchema(SQLAlchemySchema):

    access_token = fields.String(dump_only=True)
    refresh_token = fields.String(load_only=True)


class ApiTokenSchema(SQLAlchemySchema):

    api_token = fields.String(dump_only=True)


class UserEditSchema(SQLAlchemySchema):

    class Meta:
        unknown = EXCLUDE

    password = fields.String(validate=[
        validate.Length(min=6, max=36)], load_only=True)
    about_me = fields.String()
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


class PostSchemaBase(SQLAlchemyAutoSchema):

    class Meta:
        model = Post

    id = auto_field(dump_only=True)
    author = Nested(UserBaseSchema, dump_only=True)


class PostRegisterSchema(PostSchemaBase):

    @post_load
    def check_unique(self, data, **kwargs):
        if Post.get_by_uuid(data["data_uuid"]):
            raise ValidationError(field_name='data_uuid',
                                  message="Already in use.")
        return data


class ExperimentSchemaBase(SQLAlchemyAutoSchema):

    class Meta:
        model = Experiment

    id = auto_field(dump_only=True)
    author = Nested(UserBaseSchema, dump_only=True)


class ExperimentQuerySchema(ParseQueryMixin, SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    experiment_uuid = fields.String()
    name = fields.String()
    description = fields.String()


class ExperimentRegisterSchema(ExperimentSchemaBase):

    @post_load
    def check_unique(self, data, **kwargs):
        if Experiment.get_by_uuid(data["experiment_uuid"]):
            raise ValidationError(field_name='experiment_uuid',
                                  message="Already in use.")
        return data
