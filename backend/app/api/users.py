from app import db
from app.errors.handlers import HTTPAbort
from . import bp
from app.models import User, Post
# from app.api.tasks import send_async_email
from app.schemas import UserBaseSchema, UserQuerySchema, UserRecoverKeySubmitNewPassSchema, UserRegisterSchema, \
    UserEditSchema, PostQuerySchema, PostBaseSchema, UserConfirmationSchema, UserRecoverKeySchema, \
    UserRecoverKeySubmitSchema
from flask import current_app
from flask.views import MethodView
from flask_smorest import abort
from flask_jwt_extended import get_jwt_identity


@bp.route('/users')
class Users(MethodView):
    @bp.auth_required
    @bp.arguments(UserQuerySchema, location="query")
    @bp.response(UserBaseSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters):
        """List all users"""
        data, pagination_parameters.item_count = User.get(args, pagination_parameters.page,
                                                          pagination_parameters.page_size)
        return data

    @bp.arguments(UserRegisterSchema)
    @bp.response(UserRegisterSchema, code=201)
    def post(self, user):
        """
        Create a new user from a json object
        """
        key = user.add_confirmation_key()
        link = f"{current_app.config['FRONTEND_HOST']}/confirmation/submit?key={key}&username={user.username}"
        message = f"Hello {user.name}. Thank you for registering in {current_app.config['WEB_TITLE']}. \
            To confirm your registration please click in the link below.<br>\
                <a href='{link}'>{link}</a><br><br>If you did not register \
                    into our website and want to remove your email from \
                        our database please click <a href='{link}&confirm=false'>here</a>. \
                            <br><br><br>{current_app.config['WEB_TITLE']}"
        # send_async_email.delay(message)
        print(message)
        db.session.add(user)
        db.session.commit()
        return user


@bp.route('/users/recover/key')
class UsersRecoverKey(MethodView):
    @bp.arguments(UserRecoverKeySubmitSchema)
    @bp.response(UserRecoverKeySchema)
    def post(self, args):
        """
        Resend confirmation key to users' email
        """
        user = User.get_by_email(args['email'])

        if not user:
            HTTPAbort.not_found(field="email")
        if user.email_confirmed:
            HTTPAbort.email_already_confirmed()

        key = user.add_confirmation_key()
        link = f"{current_app.config['FRONTEND_HOST']}/confirmation/submit?key={key}&username={user.username}"
        message = f"Hello {user.name}. Thank you for registering in {current_app.config['WEB_TITLE']}. \
            To confirm your registration please click in the link below.<br>\
                <a href='{link}'>{link}</a><br><br>If you did not register \
                    into our website and want to remove your email from \
                        our database please click <a href='{link}&confirm=false'>here</a>. \
                            <br><br><br>{current_app.config['WEB_TITLE']}"
        # send_async_email.delay(message)
        print(message)
        db.session.commit()
        response = {"username": user.username, "email": user.email}
        print(response)
        return response


@bp.route('/users/recover/account')
class UsersRecoverAccount(MethodView):
    @bp.arguments(UserRecoverKeySubmitSchema)
    @bp.response(code=201)
    def post(self, args):
        """
        Resend reset key and info to users' email
        """
        user = User.get_by_email(args['email'])

        if not user:
            HTTPAbort.not_found(field="email")

        key = user.add_reset_key()
        link = f"{current_app.config['FRONTEND_HOST']}/recover/submit?key={key}&username={user.username}"
        message = f"Hello {user.name}. You are receiving this email because asked for a new password at \
            {current_app.config['WEB_TITLE']}. <br> \
            Your username is: {user.username} <br>\
                To reset your password please click in the link below.<br>\
                    <a href='{link}'>{link}</a><br><br>If you did not asked this \
                        you do not need to do anything and your account still safe. \
                                <br><br><br>{current_app.config['WEB_TITLE']}"
        # send_async_email.delay(message)
        print(message)
        db.session.commit()

    @bp.arguments(UserRecoverKeySubmitNewPassSchema)
    @bp.response(code=200)
    def put(self, args):
        """
        Resend reset key and info to users' email
        """
        user = User.get_by_username(args['username'])
        if not user:
            HTTPAbort.not_found(field="username")
        if not user.account_reset_key == args['account_reset_key']:
            HTTPAbort.field_invalid()
        if user.account_reset_key_expired():
            HTTPAbort.key_expired()

        user.password = args['password']
        user.add_reset_key()
        db.session.commit()


@bp.route('/users/<string:username>/confirm-email')
class UsersConfirmationSubmit(MethodView):
    @bp.arguments(UserConfirmationSchema, location="query")
    @bp.response(code=201)
    def post(self, args, username):
        """
        Confirm users' email or delete the account from the database
        """
        user = User.get_by_username(username)

        if not user:
            HTTPAbort.not_found(field="username")
        if user.email_confirmed:
            HTTPAbort.email_already_confirmed()
        if not user.email_confirmation_key == args['key']:
            HTTPAbort.field_invalid()
        if args['confirm']:
            user.email_confirmed = True
        else:
            db.session.delete(user)
        db.session.commit()


@bp.route('/users/<string:username>')
class UsersById(MethodView):
    @bp.response(UserBaseSchema)
    def get(self, username):
        """
        Show info about the user with username {username}
        """
        user = User.get_by_username(username)
        if not user or not user.active:
            HTTPAbort.not_found(field="username")
        return user

    @bp.auth_required
    @bp.arguments(UserEditSchema)
    @bp.response(UserBaseSchema)
    def put(self, args, username):
        """
        Update an existing user. Available only for that user
        """
        logged_user = User.get_by_username(get_jwt_identity())
        user = User.get_by_username(username)

        if not user or not user.active:
            HTTPAbort.not_found(field="username")
        if not logged_user.is_admin():
            if logged_user.username != user.username:
                HTTPAbort.not_authorized()

        user.update(args)
        db.session.commit()

        return user

    @bp.auth_required
    @bp.response(code=200)
    def delete(self, username):
        """
        Delete an existing user. Available only for that user
        """
        logged_user = User.get_by_username(get_jwt_identity())
        user = User.get_by_username(username)

        if not user:
            HTTPAbort.not_found(field="username")

        if not logged_user.is_admin():
            if logged_user.username != username:
                HTTPAbort.not_authorized()

        user.revoke_all_tokens()
        user.active = False
        db.session.commit()


@bp.route('/users/<string:username>/posts')
class UsersPosts(MethodView):
    @bp.auth_required
    @bp.arguments(PostQuerySchema, location="query")
    @bp.response(PostBaseSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, username):
        """
        Show all posts that belong to user with username {username} and logged_user has access
        """
        logged_user = User.get_by_username(get_jwt_identity())
        user = User.get_by_username(username)
        if not user:
            HTTPAbort.not_found(field="username")
        filter_by = {"author": user}
        query = logged_user.accessible_posts()
        order_by = Post.timestamp.desc()
        data, pagination_parameters.item_count = Post.get(args, pagination_parameters.page,
                                                          pagination_parameters.page_size,
                                                          filter_by=filter_by, order_by=order_by,
                                                          query=query)
        return data


@bp.route('/users/<string:username>/favorites')
class UsersFavorites(MethodView):
    @bp.auth_required
    @bp.arguments(PostQuerySchema, location="query")
    @bp.response(PostBaseSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, username):
        """
        Show all posts that belong to user with username {username}
        """
        user = User.get_by_username(username)
        if not user:
            HTTPAbort.not_found(field="username")
        filter = [getattr(User, 'favorited')]
        order_by = Post.timestamp.desc()
        data, pagination_parameters.item_count = Post.get(args, pagination_parameters.page,
                                                          pagination_parameters.page_size,
                                                          filter=filter, order_by=order_by)
        return data


@bp.route('/users/<string:username>/feed')
class UsersFeed(MethodView):
    @bp.auth_required
    @bp.arguments(PostQuerySchema, location="query")
    @bp.response(PostBaseSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, username):
        """
        Return posts of the feed for the user with username {username}
        """
        logged_user = User.get_by_username(get_jwt_identity())
        user = User.get_by_username(username)
        if not user or user != logged_user:
            HTTPAbort.not_found(field="username")

        if not logged_user.is_admin():
            if logged_user.username != user.username:
                HTTPAbort.not_authorized()

        data, pagination_parameters.item_count = Post.get(args, pagination_parameters.page,
                                                          pagination_parameters.page_size,
                                                          query=logged_user.followed_posts(),
                                                          order_by=Post.timestamp.desc())
        return data


@bp.route('/users/<string:username>/follow')
class UsersFollow(MethodView):
    @bp.auth_required
    @bp.response(code=200)
    def post(self, username):
        """
        Logged user follow/unfollow user with username {username}
        """
        logged_user = User.get_by_username(get_jwt_identity())
        user = User.get_by_username(username)
        if not user:
            HTTPAbort.not_found(field="username")
        if user == logged_user:
            abort(422, errors={"json": {"username": [
                  "You can not follow yourself."]}})
        if logged_user.is_following(user):
            logged_user.unfollow(user)
        else:
            logged_user.follow(user)
        db.session.commit()


@bp.route('/users/<string:username>/following')
class UsersFollowingByUsername(MethodView):
    @bp.auth_required
    @bp.arguments(UserQuerySchema, location="query")
    @bp.response(UserBaseSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, username):
        """List users who username is following"""
        user = User.get_by_username(username)
        query = user.followed
        data, pagination_parameters.item_count = User.get(args, pagination_parameters.page,
                                                          pagination_parameters.page_size,
                                                          query=query)
        return data


@bp.route('/users/<string:username>/followers')
class UsersFollowersByUsername(MethodView):
    @bp.auth_required
    @bp.arguments(UserQuerySchema, location="query")
    @bp.response(UserBaseSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, username):
        """List users who follow username"""
        user = User.get_by_username(username)
        query = user.followers
        data, pagination_parameters.item_count = User.get(args, pagination_parameters.page,
                                                          pagination_parameters.page_size,
                                                          query=query)
        return data
