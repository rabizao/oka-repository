from app import db
from . import bp
from app.models import User, Post
from app.schemas import UserBaseSchema, UserQuerySchema, UserRegisterSchema, UserEditSchema, \
    PostQuerySchema, PostBaseSchema
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


@bp.route('/users/<string:username>')
class UsersById(MethodView):
    @bp.response(UserBaseSchema)
    def get(self, username):
        """
        Show info about the user with username {username}
        """
        user = User.get_by_username(username)
        if not user or not user.active:
            abort(422, errors={"json": {"username": ["Does not exist."]}})
        return user

    @jwt_required
    @bp.arguments(UserEditSchema)
    @bp.response(UserBaseSchema)
    def put(self, args, username):
        """
        Update an existing user. Available only for that user
        """
        logged_user = User.get_by_username(get_jwt_identity())
        user = User.get_by_username(username)

        if not user:
            abort(422, errors={"json": {"username": ["Does not exist."]}})
        if not user.active:
            abort(422, errors={
                  "json": {"username": ["Your account was deleted."]}})
        if not logged_user.is_admin():
            if logged_user.username != user.username:
                abort(422, errors={
                      "json": {"username": ["You can only edit your own user."]}})

        user.update(args)
        db.session.commit()

        return user

    @jwt_required
    @bp.response(code=200)
    def delete(self, username):
        """
        Delete an existing user. Available only for that user
        """
        logged_user = User.get_by_username(get_jwt_identity())

        if not User.query.get(username):
            abort(422, errors={"json": {"username": ["Does not exist."]}})

        if not logged_user.is_admin():
            if logged_user.username != username:
                abort(422, errors={
                    "json": {"username": ["You can only edit your own user."]}})

        user = User.get_by_username(username)
        user.revoke_all_tokens()
        user.active = False
        db.session.commit()


@bp.route('/users/<string:username>/posts')
class UsersPosts(MethodView):
    @jwt_required
    @bp.arguments(PostQuerySchema, location="query")
    @bp.response(PostBaseSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, username):
        """
        Show all posts that belong to user with username {username}
        """
        user = User.get_by_username(username)
        if not user:
            abort(422, errors={"json": {"username": ["Does not exist."]}})
        filter_by = {"active": True, "author": user}
        data, total = Post.get(args, pagination_parameters.page,
                               pagination_parameters.page_size, filter_by=filter_by)
        pagination_parameters.item_count = total
        return data


@bp.route('/users/<string:username>/favorites')
class UsersFavorites(MethodView):
    @jwt_required
    @bp.arguments(PostQuerySchema, location="query")
    @bp.response(PostBaseSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, username):
        """
        Show all posts that belong to user with username {username}
        """
        user = User.get_by_username(username)
        if not user:
            abort(422, errors={"json": {"username": ["Does not exist."]}})
        filter_by = {"active": True}
        filter = [getattr(User, 'favorited')]
        data, total = Post.get(args, pagination_parameters.page,
                               pagination_parameters.page_size, filter_by=filter_by, filter=filter)
        pagination_parameters.item_count = total
        return data


@bp.route('/users/<string:username>/follow')
class UsersFollow(MethodView):
    @jwt_required
    @bp.response(code=200)
    def post(self, username):
        """
        Logged user follow/unfollow user with username {username}
        """
        user = User.get_by_username(username)
        logged_user = User.get_by_username(get_jwt_identity())
        if not user:
            abort(422, errors={"json": {"username": ["Does not exist."]}})
        if logged_user.is_following(user):
            logged_user.unfollow(user)
        else:
            logged_user.follow(user)
        db.session.commit()
