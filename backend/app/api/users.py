from app import db
from . import bp
from app.models import User, Post
from app.schemas import UserBaseSchema, UserQuerySchema, UserRegisterSchema, UserEditSchema, \
    PostQuerySchema, PostSchemaBase
from flask.views import MethodView
from flask_smorest import abort
from flask_jwt_extended import jwt_required, get_jwt_identity


@bp.route('/users')
class Users(MethodView):
    @jwt_required
    @bp.arguments(UserQuerySchema, location="query")
    @bp.response(UserBaseSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters):
        """List all users"""
        filter_by = {"active": True}
        data, total = User.get(args, pagination_parameters.page,
                               pagination_parameters.page_size, filter_by=filter_by)
        pagination_parameters.item_count = total
        return data

    @bp.arguments(UserRegisterSchema)
    @bp.response(UserRegisterSchema)
    def post(self, user):
        """
        Create a new user from a json object
        """
        db.session.add(user)
        db.session.commit()
        return user


@bp.route('/users/<int:id>')
class UsersById(MethodView):
    @bp.response(UserBaseSchema)
    def get(self, id):
        """
        Show info about the user with id {id}
        """
        user = User.query.get(id)
        if not user or not user.active:
            abort(422, errors={"json": {"id": ["Does not exist."]}})
        return user

    @jwt_required
    @bp.arguments(UserEditSchema)
    @bp.response(UserBaseSchema)
    def put(self, args, id):
        """
        Update an existing user. Available only for that user
        """
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        user = User.query.get(id)

        if not user:
            abort(422, errors={"json": {"id": ["Does not exist."]}})
        if not user.active:
            abort(422, errors={
                  "json": {"username": ["Your account was deleted."]}})
        if not logged_user.is_admin():
            if logged_user.id != user.id:
                abort(422, errors={
                      "json": {"id": ["You can only edit your own user."]}})

        user.update(args)
        db.session.commit()

        return user

    @jwt_required
    @bp.response(code=200)
    def delete(self, id):
        """
        Delete an existing user. Available only for that user
        """
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)

        if not User.query.get(id):
            abort(422, errors={"json": {"id": ["Does not exist."]}})

        if not logged_user.is_admin():
            if logged_user.id != id:
                abort(422, errors={
                    "json": {"id": ["You can only edit your own user."]}})

        user = User.query.get(id)
        user.revoke_all_tokens()
        user.active = False
        db.session.commit()


@bp.route('/users/<int:id>/posts')
class UsersPosts(MethodView):
    @jwt_required
    @bp.arguments(PostQuerySchema, location="query")
    @bp.response(PostSchemaBase(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, id):
        """
        Show all posts that belong to user with id {id}
        """
        user = User.query.get(id)
        if not user:
            abort(422, errors={"json": {"id": ["Does not exist."]}})
        filter_by = {"active": True, "author": user}
        data, total = Post.get(args, pagination_parameters.page,
                               pagination_parameters.page_size, filter_by=filter_by)
        pagination_parameters.item_count = total
        return data
