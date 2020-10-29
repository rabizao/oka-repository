from app import db
from . import bp
from app.models import User, Message
from app.schemas import MessageBaseSchema, MessageListSchema
from flask.views import MethodView
from flask_smorest import abort
from flask_jwt_extended import jwt_required, get_jwt_identity


@bp.route('/messages/<string:username>')
class MessagesByUsername(MethodView):
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

        filter_by = {"recipient": logged_user}
        order_by = Message.timestamp.desc()
        data, pagination_parameters.item_count = Message.get(args, pagination_parameters.page,
                                                             pagination_parameters.page_size,
                                                             filter_by=filter_by, order_by=order_by)
        return data

    @jwt_required
    @bp.arguments(MessageBaseSchema)
    @bp.response(code=201)
    def post(self, args, username):
        """
        Send a message from logged user to the user with username {username}
        """
        user = User.get_by_username(username)
        if not user:
            abort(422, errors={"json": {"username": [
                  "Does not exist. [" + self.__class__.__name__ + "]"]}})
        logged_user = User.get_by_username(get_jwt_identity())
        message = Message(body=args['body'],
                          author=logged_user, recipient=user)
        db.session.add(message)
        db.session.commit()


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
