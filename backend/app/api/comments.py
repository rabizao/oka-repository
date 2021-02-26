from app.errors.handlers import HTTPAbort
from . import bp
from app.models import User, Comment
from app.schemas import CommentBaseSchema

from flask.views import MethodView
from flask_jwt_extended import get_jwt_identity


@bp.route('/comments/<int:id>/replies')
class CommentsRepliesById(MethodView):
    @bp.auth_required
    @bp.response(200, CommentBaseSchema(many=True))
    @bp.paginate()
    def get(self, pagination_parameters, id):
        """
        Return the replies of a comment with id {id}
        """
        comment = Comment.query.get(id)
        if not comment or not comment.active:
            HTTPAbort.not_found()

        replies = comment.replies
        pagination_parameters.item_count = replies.count()

        return replies

    @bp.auth_required
    @bp.arguments(CommentBaseSchema)
    @bp.response(201, CommentBaseSchema)
    def post(self, args, id):
        """
        Create a new reply for the comment with id {id}
        """
        comment = Comment.query.get(id)
        if not comment or not comment.active:
            HTTPAbort.not_found()

        logged_user = User.get_by_username(get_jwt_identity())
        reply = comment.add_reply(text=args['text'], author=logged_user)

        return reply
