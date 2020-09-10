from . import bp
from app.models import User, Comment
from app.schemas import CommentBaseSchema

from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_smorest import abort


@bp.route('/comments/<int:id>/replies')
class CommentsRepliesById(MethodView):
    @jwt_required
    @bp.response(CommentBaseSchema(many=True))
    @bp.paginate()
    def get(self, pagination_parameters, id):
        """
        Return the replies of a comment with id {id}
        """
        comment = Comment.query.get(id)
        if not comment or not comment.active:
            abort(422, errors={"json": {"id": ["Does not exist. [" + self.__class__.__name__ + "]"]}})

        replies = comment.replies
        pagination_parameters.item_count = replies.count()

        return replies

    @jwt_required
    @bp.arguments(CommentBaseSchema)
    @bp.response(CommentBaseSchema)
    def post(self, args, id):
        """
        Create a new reply for the comment with id {id}
        """
        comment = Comment.query.get(id)
        if not comment or not comment.active:
            abort(422, errors={"json": {"id": ["Does not exist. [" + self.__class__.__name__ + "]"]}})

        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        reply = comment.add_reply(text=args['text'], author=logged_user)

        return reply
