from . import bp
from pjdata.creation import read_arff
from cururu.persistence import DuplicateEntryException
import uuid as u

from flask import current_app
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_smorest import abort
from app import db
from app.models import User, Post, Comment, Transformation
from app.schemas import (PostQuerySchema, PostBaseSchema, PostFilesSchema, PostEditSchema, CommentBaseSchema,
                         CommentQuerySchema)


# noinspection PyArgumentList
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
        data, pagination_parameters.item_count = Post.get(args, pagination_parameters.page,
                                                          pagination_parameters.page_size, filter_by=filter_by)
        return data

    @jwt_required
    @bp.arguments(PostFilesSchema, location="files")
    @bp.response(PostBaseSchema(many=True))
    def post(self, args):
        """
        Create a new post to the logged user
        """
        storage = current_app.config['CURURU_SERVER']
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        files = args['files']
        posts = []

        for file in files:
            full_path = current_app.config['TMP_FOLDER'] + str(u.uuid4())
            file.save(full_path)
            _, data, name, description = read_arff(full_path)
            if logged_user.posts.filter_by(data_uuid=data.id).first():
                abort(422, errors={"json": {"Upload": ["Dataset already exists!"]}})
            try:
                storage.store(data)
            except DuplicateEntryException:
                print('Duplicate! Ignored.')
            finally:
                post = Post(author=logged_user, data_uuid=data.id, name=name, description=description)
                for dic in storage.visual_history(data.id, current_app.static_folder):
                    Transformation(**dic, post=post)
                db.session.add(post)
                posts.append(post)

        db.session.commit()
        return posts


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

    @jwt_required
    @bp.arguments(PostEditSchema)
    @bp.response(code=200)
    def put(self, args, id):
        """
        Edit post with id {id}
        """
        logged_user = User.get_by_username(get_jwt_identity())
        post = Post.query.get(id)

        if not post or not post.active:
            abort(422, errors={"json": {"id": ["Does not exist."]}})

        if not logged_user.is_admin():
            if logged_user != post.author:
                abort(422, errors={
                    "json": {"id": ["You can only edit your own datasets."]}})

        post.update(args)
        db.session.commit()


@bp.route('/posts/<int:id>/favorite')
class PostsFavoriteById(MethodView):
    @jwt_required
    @bp.response(code=200)
    def post(self, id):
        """
        Favorite/unfavorite post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={"json": {"id": ["Does not exist."]}})

        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        if logged_user.has_favorited(post):
            logged_user.unfavorite(post)
        else:
            logged_user.favorite(post)


@bp.route('/posts/<int:id>/comments')
class PostsCommentsById(MethodView):
    @jwt_required
    @bp.arguments(CommentQuerySchema, location="query")
    @bp.response(CommentBaseSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, id):
        """
        Return the comments of a post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={"json": {"id": ["Does not exist."]}})

        order_by = getattr(Comment.timestamp, args['order_by'])()
        comments = post.comments.order_by(order_by)
        pagination_parameters.item_count = comments.count()

        return comments

    @jwt_required
    @bp.arguments(CommentBaseSchema)
    @bp.response(CommentBaseSchema)
    def post(self, args, id):
        """
        Create a new comment for the post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={"json": {"id": ["Does not exist."]}})

        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        comment = post.add_comment(text=args['text'], author=logged_user)

        return comment


@bp.route('/posts/<int:id>/history')
class PostsHistoryById(MethodView):
    @jwt_required
    @bp.response(code=200)
    def get(self, id):
        """
        Return the history of a dataset of a post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={"json": {"id": ["Does not exist."]}})

        storage = current_app.config['CURURU_SERVER']
        # TODO: show uuid-avatar along with post name in the web interface
        return storage.visual_history(post.data_uuid, "http://127.0.0.1:5000/", current_app.static_folder)


@bp.route('/posts/<int:id>/stats')
class PostsStatsById(MethodView):
    @jwt_required
    @bp.response(code=200)
    def get(self, id):
        """
        Return the stats of a dataset of a post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={"json": {"id": ["Does not exist."]}})

        # uuid = post.data_uuid
        # TODO


@bp.route('/posts/<int:id>/twins')
class PostsTwinsById(MethodView):
    @jwt_required
    @bp.arguments(PostQuerySchema, location="query")
    @bp.response(PostBaseSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, id):
        """
        Return the twins of a post with id {id}
        """
        post = Post.query.get(id)
        if not post:
            abort(422, errors={"json": {"id": ["Does not exist."]}})

        filter_by = {"active": True, "data_uuid": post.data_uuid, "id": not id}
        data, pagination_parameters.item_count = Post.get(args, pagination_parameters.page,
                                                          pagination_parameters.page_size, filter_by=filter_by)
        return data
