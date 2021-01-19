from app import db
from app.errors.handlers import HTTPAbort
from . import bp
from app.models import User, Message
from app.schemas import MessageBaseSchema, MessageListSchema
from flask.views import MethodView
from flask_smorest import abort
from flask_jwt_extended import get_jwt_identity
from sqlalchemy.sql import expression
from sqlalchemy import types, case
from datetime import datetime


@bp.route('/messages/<string:username>')
class MessagesByUsername(MethodView):
    @bp.auth_required
    @bp.arguments(MessageListSchema, location="query")
    @bp.response(MessageListSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, username):
        """
        Show all messages that logged user received from user with username {username}
        """
        user = User.get_by_username(username)
        if not user:
            HTTPAbort.not_found(field="username")
        logged_user = User.get_by_username(get_jwt_identity())
        filter_by = {"recipient": logged_user, "author": user}
        order_by = Message.timestamp.desc()
        data, pagination_parameters.item_count = Message.get(args, pagination_parameters.page,
                                                             pagination_parameters.page_size,
                                                             filter_by=filter_by, order_by=order_by)
        return data

    @bp.auth_required
    @bp.arguments(MessageBaseSchema)
    @bp.response(MessageBaseSchema)
    def post(self, args, username):
        """
        Send a message from logged user to the user with username {username}
        """
        user = User.get_by_username(username)
        if not user:
            HTTPAbort.not_found(field="username")
        logged_user = User.get_by_username(get_jwt_identity())
        if user == logged_user:
            abort(422, errors={"json": {"username": [
                  "You can not send a message to yourself."]}})
        message = Message(body=args['body'],
                          author=logged_user, recipient=user)
        db.session.add(message)
        user.add_notification(
            "unread_message_count", user.new_messages(), overwrite=True)
        db.session.commit()

        return message


@bp.route('/messages/<string:username>/conversation')
class MessagesConversationByUsername(MethodView):
    @bp.auth_required
    @bp.arguments(MessageListSchema, location="query")
    @bp.response(MessageListSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, username):
        """
        Show all messages between logged user and user with username {username}
        """
        user = User.get_by_username(username)
        if not user:
            HTTPAbort.not_found(field="username")
        logged_user = User.get_by_username(get_jwt_identity())

        logged_user_messages = Message.query.filter_by(
            recipient=logged_user, author=user)
        user_messages = Message.query.filter_by(
            recipient=user, author=logged_user)
        query = logged_user_messages.union(user_messages)

        order_by = Message.timestamp.desc()
        data, pagination_parameters.item_count = Message.get(args, pagination_parameters.page,
                                                             pagination_parameters.page_size,
                                                             query=query, order_by=order_by)
        return data


@bp.route('/messages/<string:username>/lasts')
class MessagesLastsByUsername(MethodView):
    @bp.auth_required
    @bp.arguments(MessageListSchema, location="query")
    @bp.response(MessageListSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, username):
        """
        Show all messages that belong to user with username {username}
        """
        user = User.get_by_username(username)
        if not user:
            HTTPAbort.not_found(field="username")
        logged_user = User.get_by_username(get_jwt_identity())
        if user != logged_user:
            HTTPAbort.not_authorized()

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

        logged_user.last_message_read_time = datetime.utcnow()
        logged_user.add_notification(
            name='unread_message_count', data=0, overwrite=True)
        db.session.commit()

        data, pagination_parameters.item_count = Message.get(args, pagination_parameters.page,
                                                             pagination_parameters.page_size,
                                                             query=query, filter_by={})
        return data


@bp.route('/messages/<int:id>')
class MessagesById(MethodView):
    @bp.auth_required
    @bp.response(MessageListSchema)
    def get(self, id):
        """
        This route should return a json object containing the contact with id <id> in the database.
        Available only for the admins
        """
        logged_user = User.get_by_username(get_jwt_identity())
        message = Message.query.get(id)
        if not message or not message.active:
            HTTPAbort.not_found()
        if not message.author == logged_user and not message.recipient == logged_user:
            abort(422, errors={
                "json":
                {"id":
                 ["Only the sender and the recipient have access to this message."
                  ]
                 }})
        return message
