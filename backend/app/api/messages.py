from app import db
from . import bp
from app.models import User, Message
from app.schemas import MessageBaseSchema, MessageListSchema
from flask.views import MethodView
from flask_smorest import abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.sql import expression
from sqlalchemy import types, case


@bp.route('/messages/<string:username>')
class MessagesByUsername(MethodView):
    @jwt_required
    @bp.arguments(MessageListSchema, location="query")
    @bp.response(MessageListSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, username):
        """
        Show all messages that logged user received from user with username {username}
        """
        user = User.get_by_username(username)
        if not user:
            abort(422, errors={"json": {"username": [
                  "Does not exist. [" + self.__class__.__name__ + "]"]}})
        logged_user = User.get_by_username(get_jwt_identity())

        filter_by = {"recipient": logged_user, "author": user}
        order_by = Message.timestamp.desc()
        data, pagination_parameters.item_count = Message.get(args, pagination_parameters.page,
                                                             pagination_parameters.page_size,
                                                             filter_by=filter_by, order_by=order_by)
        return data

    @jwt_required
    @bp.arguments(MessageBaseSchema)
    @bp.response(MessageBaseSchema)
    def post(self, args, username):
        """
        Send a message from logged user to the user with username {username}
        """
        user = User.get_by_username(username)
        if not user:
            abort(422, errors={"json": {"username": [
                  "Does not exist. [" + self.__class__.__name__ + "]"]}})
        logged_user = User.get_by_username(get_jwt_identity())
        if user == logged_user:
            abort(422, errors={"json": {"username": [
                  "You can not send a message to yourself. [" + self.__class__.__name__ + "]"]}})
        message = Message(body=args['body'],
                          author=logged_user, recipient=user)
        db.session.add(message)
        db.session.commit()
        return message


@bp.route('/messages/<string:username>/conversation')
class MessagesConversationByUsername(MethodView):
    @jwt_required
    @bp.arguments(MessageListSchema, location="query")
    @bp.response(MessageListSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, username):
        """
        Show all messages between logged user and user with username {username}
        """
        user = User.get_by_username(username)
        if not user:
            abort(422, errors={"json": {"username": [
                  "Does not exist. [" + self.__class__.__name__ + "]"]}})
        logged_user = User.get_by_username(get_jwt_identity())

        logged_user_messages = Message.query.filter_by(
            recipient=logged_user, author=user)
        user_messages = Message.query.filter_by(
            recipient=user, author=logged_user)
        query = logged_user_messages.union(user_messages)

        order_by = Message.timestamp.asc()
        data, pagination_parameters.item_count = Message.get(args, pagination_parameters.page,
                                                             pagination_parameters.page_size,
                                                             query=query, order_by=order_by)
        return data


@bp.route('/messages/<string:username>/lasts')
class MessagesLastsByUsername(MethodView):
    @jwt_required
    @bp.arguments(MessageListSchema, location="query")
    @bp.response(MessageListSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, username):
        """
        Show all messages that belong to user with username {username}
        """
        user = User.get_by_username(username)
        if not user:
            abort(422, errors={"json": {"username": [
                  "Does not exist. [" + self.__class__.__name__ + "]"]}})
        logged_user = User.get_by_username(get_jwt_identity())
        if user != logged_user:
            abort(422, errors={"json": {"username": [
                  "You can only check your messages. [" + self.__class__.__name__ + "]"]}})

        xpr = case(
            [
                (Message.sender_id > Message.recipient_id,
                 expression.cast(Message.sender_id, types.Unicode) + ',' + expression.cast(
                     Message.recipient_id, types.Unicode)),
            ],
            else_=expression.cast(Message.recipient_id, types.Unicode) + ',' + expression.cast(
                Message.sender_id, types.Unicode)).label("sender_recipient")
        subqry = db.session.query(Message.id, xpr).order_by(
            Message.timestamp.desc()).subquery()
        query = Message.query.join(subqry, Message.id == subqry.c.id).group_by(
            subqry.c.sender_recipient)

        data, pagination_parameters.item_count = Message.get(args, pagination_parameters.page,
                                                             pagination_parameters.page_size,
                                                             query=query, filter_by={})
        return data


@bp.route('/messages/<int:id>')
class MessagesById(MethodView):
    @jwt_required
    @bp.response(MessageListSchema)
    def get(self, id):
        """
        This route should return a json object containing the contact with id <id> in the database.
        Available only for the admins
        """
        logged_user = User.get_by_username(get_jwt_identity())

        message = Message.query.get(id)
        if not message or not message.active:
            abort(422, errors={
                  "json": {"id": ["Does not exist. [" + self.__class__.__name__ + "]"]}})
        if not message.author == logged_user and not message.recipient == logged_user:
            abort(422, errors={
                  "json":
                  {"id":
                   ["Only the sender and the recipient have access to this message. [" + self.__class__.__name__ + "]"
                    ]
                   }})
        return message
