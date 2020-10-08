from . import bp
from app.schemas import NotificationQuerySchema, NotificationBaseSchema
from app.models import Notification, User
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity


@bp.route('/notifications')
class Downloads(MethodView):
    @jwt_required
    @bp.arguments(NotificationQuerySchema, location="query")
    @bp.response(NotificationBaseSchema(many=True))
    def get(self, args):
        """Return all notifications of the logged user since the requested time"""

        username = get_jwt_identity()
        logged_user = User.get_by_username(username)

        notifications = logged_user.notifications.filter(
            Notification.timestamp > args["since"]).order_by(
                Notification.timestamp.asc())[-10:]
        return notifications
