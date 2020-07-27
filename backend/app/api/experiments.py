from . import bp
from app import db
from flask.views import MethodView
from app.schemas import ExperimentQuerySchema, ExperimentBaseSchema, ExperimentRegisterSchema
from app.models import User, Experiment
from flask_jwt_extended import jwt_required, get_jwt_identity


@bp.route("/experiments")
class Experiments(MethodView):
    @jwt_required
    @bp.arguments(ExperimentQuerySchema, location="query")
    @bp.response(ExperimentBaseSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters):
        """
        Show all experiments
        """
        filter_by = {"active": True}
        data, total = Experiment.get(args, pagination_parameters.page,
                                     pagination_parameters.page_size, filter_by=filter_by)
        pagination_parameters.item_count = total
        return data

    @jwt_required
    @bp.arguments(ExperimentRegisterSchema)
    @bp.response(ExperimentBaseSchema)
    def post(self, args):
        """
        Create a new experiment to the logged user
        """
        # TODO:Get files from front end and store in Davi's package
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        experiment = Experiment(**args, author=logged_user)
        db.session.add(experiment)
        db.session.commit()

        return experiment
