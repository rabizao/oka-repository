from app import db
from . import bp
from app.api.tasks import send_async_email
from app.models import Contact, User
from app.schemas import ContactBaseSchema
from flask.views import MethodView
from flask_smorest import abort
from flask_jwt_extended import jwt_required, get_jwt_identity


@bp.route('/contacts')
class Contacts(MethodView):
    @jwt_required
    @bp.arguments(ContactBaseSchema, location="query")
    @bp.response(ContactBaseSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters):
        """
        This route should return a json object containing all contacts in the database and should be available
        to the admins
        """
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)

        if logged_user.role != 10:
            abort(422, errors={"json": {"role": ["Not allowed."]}})

        data, pagination_parameters.item_count = Contact.get(args, pagination_parameters.page,
                                                             pagination_parameters.page_size)
        return data

    @bp.arguments(ContactBaseSchema)
    @bp.response(code=201)
    def post(self, args):
        """
        This route should receive the info of the contact form, store and
        send an email to us with its content
        """
        contact = Contact(**args)
        db.session.add(contact)
        db.session.commit()
        message = str(contact.name) \
            + "<br>email: " + str(contact.email) + "<br>Escreveu:<br><br>" \
            + str(contact.message)
        send_async_email.delay(message)


@bp.route('/contacts/<int:id>')
class ContactsById(MethodView):
    @jwt_required
    @bp.response(ContactBaseSchema)
    def get(self, id):
        """
        This route should return a json object containing the contact with id <id> in the database.
        Available only for the admins
        """
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)

        if logged_user.role != 10:
            abort(422, errors={"json": {"role": ["Not allowed."]}})

        contact = Contact.query.get(id)
        if not contact or not contact.active:
            abort(422, errors={"json": {"id": ["Does not exist. [" + self.__class__.__name__ + "]"]}})
        return contact
