from . import bp
from flask.views import MethodView
from app import db
from app.schemas import JobQueryArgsSchema, JobSchema
from app.models import Job


@bp.route('/jobs')
class Jobs(MethodView):
    @bp.arguments(JobQueryArgsSchema, location="query")
    @bp.response(JobSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters):
        """List all jobs currently available"""
        data, total = Job.get(args, pagination_parameters.page,
                              pagination_parameters.page_size)
        pagination_parameters.item_count = total
        return data

    @bp.arguments(JobSchema)
    @bp.response(JobSchema)
    def post(self, job):
        """Post a new job with tags"""
        db.session.add(job)
        db.session.commit()
        return job
