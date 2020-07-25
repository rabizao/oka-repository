from . import bp
from app import db
from flask.views import MethodView
from app.schemas import PostQuerySchema, PostSchemaBase, PostRegisterSchema
from app.models import User, Post
from flask_jwt_extended import jwt_required, get_jwt_identity


@bp.route("/posts")
class Posts(MethodView):
    @jwt_required
    @bp.arguments(PostQuerySchema, location="query")
    @bp.response(PostSchemaBase(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters):
        """
        Show all posts
        """
        filter_by = {"active": True}
        data, total = Post.get(args, pagination_parameters.page,
                               pagination_parameters.page_size, filter_by=filter_by)
        pagination_parameters.item_count = total
        return data

    @jwt_required
    @bp.arguments(PostRegisterSchema)
    @bp.response(PostSchemaBase)
    def post(self, args):
        """
        Create a new post to the logged user
        """
        # TODO:Get files from front end and store in Davi's package
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        post = Post(**args, author=logged_user)
        db.session.add(post)
        db.session.commit()

        return post
