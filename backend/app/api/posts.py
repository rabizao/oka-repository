from . import bp
from app import db
from app.schemas import PostQuerySchema, PostBaseSchema, PostFilesSchema
from app.models import User, Post
from flask.views import MethodView
from flask_smorest import abort
from flask_jwt_extended import jwt_required, get_jwt_identity


@bp.route("/posts")
class Posts(MethodView):
    @jwt_required
    @bp.arguments(PostQuerySchema, location="query")
    @bp.response(PostBaseSchema(many=True))
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
    @bp.arguments(PostFilesSchema, location="files")
    @bp.response(PostBaseSchema)
    def post(self, files):
        """
        Create a new post to the logged user
        """
        print(files)
        # TODO:Get files from front end and store in cururu
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        post = Post(author=logged_user)
        db.session.add(post)
        db.session.commit()

        return post


@bp.route('/posts/<int:id>')
class PostsById(MethodView):
    @bp.response(PostBaseSchema)
    def get(self, id):
        """
        Show info about the post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={"json": {"id": ["Does not exist."]}})
        return post
