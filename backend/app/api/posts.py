import json
import uuid as u
from datetime import datetime

from flask import current_app
from flask.views import MethodView
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_smorest import abort

from app import db
from app.models import Comment, Post, User
from app.schemas import (CommentBaseSchema, CommentQuerySchema, PostBaseSchema,
                         PostEditSchema, PostFilesSchema, PostQuerySchema,
                         RunSchema, TaskBaseSchema, UserBaseSchema, StatsQuerySchema, PostCreateSchema,
                         PostActivateSchema)
from . import bp
from .tasks import create_post


def save_files(input_files):
    files = []
    for file in input_files:
        full_path = current_app.config['TMP_FOLDER'] + \
                    str(u.uuid4()) + file.filename[-10:]
        file.save(full_path)
        files.append({"path": full_path, "original_name": file.filename})
    return files


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
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)

        data, pagination_parameters.item_count = Post.get(args, pagination_parameters.page,
                                                          pagination_parameters.page_size,
                                                          query=logged_user.accessible_posts())
        return data

    @jwt_required
    @bp.arguments(PostFilesSchema, location="files")
    @bp.response(TaskBaseSchema)
    def post(self, argsFiles):
        """
        Create a new post to the logged user
        """
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)

        files = save_files(argsFiles['files'])

        task = logged_user.launch_task('process_file',
                                       "Processing your uploaded files",
                                       [files, username])
        db.session.commit()
        return task

    @jwt_required
    @bp.arguments(PostCreateSchema)
    @bp.response(code=200)
    def put(self, args):
        """
        Create inactive post (and without Data for a while), and parents.
        """
        logged_user = User.get_by_username(get_jwt_identity())
        did = args["data_uuid"]
        obj = create_post(logged_user, did, args["name"], args["description"], active=False, info=args["info"])
        if obj["code"] != "success":
            abort(422, errors={"json": {"data_uuid": obj["message"]}})


# noinspection PyArgumentList
@bp.route("/posts/activate")
class PostsActivate(MethodView):
    @jwt_required
    @bp.arguments(PostActivateSchema)
    @bp.response(code=200)
    def put(self, args):
        """
        Activate post with id {id}
        """
        logged_user = User.get_by_username(get_jwt_identity())
        post = Post.query.filter_by(data_uuid=args["data_uuid"], user_id=logged_user.id).first()
        if not post:
            abort(422, errors={
                "json": {"data_uuid": ["Post not found."]}})
        post.active = True
        db.session.commit()


@bp.route('/posts/<int:id>')
class PostsById(MethodView):
    @jwt_required
    @bp.response(PostBaseSchema)
    def get(self, id):
        """
        Show info about the post with id {id}
        """
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)

        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={
                "json": {"id": ["Does not exist."]}})
        if not logged_user.has_access(post):
            abort(422, errors={
                "json": {"id": ["You dont have access to this post."]}})
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
            abort(422, errors={
                "json": {"id": ["Does not exist."]}})

        if post.public:
            abort(422, errors={
                "json": {"id": ["Public posts can not be edited."]}})

        if not logged_user.is_admin():
            if logged_user != post.author:
                abort(422, errors={
                    "json": {"id": ["You can only edit your own datasets."]}})

        post.update(args)
        db.session.commit()

    @jwt_required
    @bp.response(code=200)
    def delete(self, id):
        """
        Delete post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={
                "json": {"id": ["Does not exist."]}})

        if post.public:
            abort(422, errors={
                "json": {"id": ["Public posts can not be deleted."]}})

        logged_user = User.get_by_username(get_jwt_identity())
        if post.author != logged_user:
            abort(422, errors={
                "json": {"id": ["Only the author can delete the post."]}})

        post.active = False
        db.session.commit()


@bp.route('/posts/<int:id>/collaborators')
class PostsCollaboratorsById(MethodView):
    @jwt_required
    @bp.arguments(UserBaseSchema(only=["username"]))
    @bp.response(code=201)
    def post(self, args, id):
        """
        Grant/Deny access to a collaborator to the post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={
                "json": {"id": ["Does not exist."]}})

        collaborator = User.get_by_username(args["username"])
        if not collaborator:
            abort(422, errors={
                "json": {"username": ["Does not exist."]}})

        username = get_jwt_identity()
        logged_user = User.get_by_username(username)

        if post.author == collaborator:
            abort(422, errors={
                "json": {"username": ["You can not invite yourself."]}})

        if not post.author == logged_user:
            abort(422, errors={
                "json": {"username":
                    [
                        "Only the author can invite collaborators to the post."]}})

        if collaborator.has_access(post):
            collaborator.deny_access(post)
        else:
            collaborator.grant_access(post)
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
            abort(422, errors={
                "json": {"id": ["Does not exist."]}})

        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        if logged_user.has_favorited(post):
            logged_user.unfavorite(post)
        else:
            logged_user.favorite(post)


@bp.route('/posts/<int:id>/publish')
class PostsPublishById(MethodView):
    @jwt_required
    @bp.response(code=200)
    def post(self, id):
        """
        Publish post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={
                "json": {"id": ["Does not exist."]}})

        if post.public:
            abort(422, errors={
                "json": {"id": ["The post is already published."]}})

        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        if post.author != logged_user:
            abort(422, errors={
                "json": {"id": ["Only the author can publish the post."]}})

        # TODO: Verify if the post has all classification variables before next steps

        post.public = True
        post.publish_timestamp = datetime.utcnow()
        db.session.commit()


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
            abort(422, errors={
                "json": {"id": ["Does not exist."]}})

        order_by = getattr(Comment.timestamp, args['order_by'])()
        query = post.comments
        args.pop('order_by', None)
        data, pagination_parameters.item_count = Post.get(args, pagination_parameters.page,
                                                          pagination_parameters.page_size,
                                                          query=query, order_by=order_by)
        return data

    @jwt_required
    @bp.arguments(CommentBaseSchema)
    @bp.response(CommentBaseSchema)
    def post(self, args, id):
        """
        Create a new comment for the post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={
                "json": {"id": ["Does not exist."]}})

        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        comment = post.add_comment(text=args['text'], author=logged_user)

        return comment


@bp.route('/posts/<int:id>/stats')
class PostsStatsById(MethodView):
    @jwt_required
    @bp.arguments(StatsQuerySchema, location="query")
    def get(self, args, id):
        """
        Return the stats of a dataset of a post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={
                "json": {"id": ["Does not exist."]}})

        tatu = current_app.config['TATU_SERVER']
        data = tatu.fetch(post.data_uuid, lazy=False)

        datas = []
        for m in data.Yt[0]:
            inner = []
            for k in range(len(data.X)):
                if m == data.Y[k]:
                    inner.append(
                        {
                            "x": data.X[k, args['x']],
                            "y": data.X[k, args['y']],
                        })
            datas.append(
                {
                    "id": m,
                    "data": inner
                })

        return json.dumps(datas)


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
            abort(422, errors={
                "json": {"id": ["Does not exist."]}})

        username = get_jwt_identity()
        logged_user = User.get_by_username(username)

        data, pagination_parameters.item_count = Post.get(args, pagination_parameters.page,
                                                          pagination_parameters.page_size,
                                                          query=logged_user.accessible_twin_posts(post))
        return data


@bp.route('/posts/<int:id>/run')
class PostsTransformById(MethodView):
    @jwt_required
    @bp.arguments(RunSchema)
    @bp.response(TaskBaseSchema)
    def post(self, args, id):
        """
        Return the twins of a post with id {id}
        """
        post = Post.query.get(id)
        if not post:
            abort(422, errors={"json": {"id": ["Does not exist."]}})

        username = get_jwt_identity()
        logged_user = User.get_by_username(username)

        task = logged_user.launch_task('run_step', 'Processing your simulation',
                                       [post.id, args["step"], username])
        db.session.commit()
        return task
