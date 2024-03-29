from . import bp
from app import db
from app.schemas import NotificationQuerySchema, NotificationBaseSchema
from app.models import Notification, User
from flask.views import MethodView
from flask_jwt_extended import get_jwt_identity
from datetime import datetime


@bp.route('/notifications')
class Notifications(MethodView):
    @bp.auth_required
    @bp.arguments(NotificationQuerySchema, location="query")
    @bp.response(200, NotificationBaseSchema(many=True))
    def get(self, args):
        """Return all notifications of the logged user since the requested time"""

        logged_user = User.get_by_username(get_jwt_identity())
        notifications = logged_user.notifications.filter(
            Notification.timestamp > args["since"]).order_by(
                Notification.timestamp.asc())
        return notifications


@bp.route('/notifications/read')
class NotificationsReadTime(MethodView):
    @bp.auth_required
    @bp.response(201)
    def put(self):
        """Update the last read time of notifications"""
        logged_user = User.get_by_username(get_jwt_identity())

        logged_user.last_notification_read_time = datetime.utcnow()
        logged_user.add_notification(
            name='unread_notification_count', data=0, overwrite=True)
        db.session.commit()
