from aiuna import Root
from cruipto.uuid import UUID
from . import bp
from flask import current_app
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_smorest import abort
from datetime import datetime

from app import db
from app.models import User, Post, Comment, Task, Transformation
from app.api.tasks import celery_process_data
from app.schemas import (PostQuerySchema, PostBaseSchema, PostFilesSchema, PostEditSchema, CommentBaseSchema,
                         CommentQuerySchema, TransformQuerySchema, PostCollaboratorSchema)
import uuid as u


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
    @bp.response(code=201)
    def post(self, argsFiles):
        """
        Create a new post to the logged user
        """
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)

        original_names = []
        files = []

        for file in argsFiles['files']:
            full_path = current_app.config['TMP_FOLDER'] + str(u.uuid4()) + file.filename[-10:]
            file.save(full_path)
            files.append({"path": full_path, "original_name": file.filename})
            original_names.append(file.filename)

        job = celery_process_data.apply_async(
            [files, username])
        task = Task(id=job.id, name="Data processing",
                    description="Processing your uploaded files: " + ", ".join(original_names), user=logged_user)
        db.session.add(task)
        db.session.commit()
        return job.id


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
                "json": {"id": ["Does not exist. [" + self.__class__.__name__ + "]"]}})
        if not logged_user.has_access(post):
            abort(422, errors={
                "json": {"id": ["You dont have access to this post. [" + self.__class__.__name__ + "]"]}})

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
                "json": {"id": ["Does not exist. [" + self.__class__.__name__ + "]"]}})

        if not logged_user.is_admin():
            if logged_user != post.author:
                abort(422, errors={
                    "json": {"id": ["You can only edit your own datasets."]}})

        post.update(args)
        db.session.commit()


@bp.route('/posts/<int:id>/collaborators')
class PostsCollaboratorsById(MethodView):
    @jwt_required
    @bp.arguments(PostCollaboratorSchema)
    @bp.response(code=201)
    def post(self, args, id):
        """
        Grant/Deny access to a collaborator to the post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={
                "json": {"id": ["Does not exist. [" + self.__class__.__name__ + "]"]}})

        collaborator = User.get_by_username(args["username"])
        if not collaborator:
            abort(422, errors={
                "json": {"username": ["Does not exist. [" + self.__class__.__name__ + "]"]}})

        username = get_jwt_identity()
        logged_user = User.get_by_username(username)

        if not post.author == logged_user:
            abort(422, errors={
                "json": {"username":
                         ["Only the author can invite collaborators to the post. [" + self.__class__.__name__ + "]"]}})

        if collaborator.has_access(post):
            collaborator.deny_access(post)
        else:
            collaborator.grant_access(post)


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
                "json": {"id": ["Does not exist. [" + self.__class__.__name__ + "]"]}})

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
                "json": {"id": ["Does not exist. [" + self.__class__.__name__ + "]"]}})

        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        if post.author != logged_user:
            abort(422, errors={
                "json": {"id": ["Only the author can publish the post. [" + self.__class__.__name__ + "]"]}})

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
                "json": {"id": ["Does not exist. [" + self.__class__.__name__ + "]"]}})

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
            abort(422, errors={
                "json": {"id": ["Does not exist. [" + self.__class__.__name__ + "]"]}})

        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        comment = post.add_comment(text=args['text'], author=logged_user)

        return comment


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
            abort(422, errors={
                "json": {"id": ["Does not exist. [" + self.__class__.__name__ + "]"]}})

        # uuid = post.data_uuid

        # TODO: retornar um json contendo os dados que serao plotados no frontend. Pensar diferentes graficos para
        # serem feitos la. Possibilidades: Todas as features x target, features x features, etc. Tirar ideias do
        # pandas-profilling. Outra informacao importante sao algumas linhas das tabelas (tipo pd.head() e pd.tail())
        # Pearsons correlation, Missing values, etc.


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
                "json": {"id": ["Does not exist. [" + self.__class__.__name__ + "]"]}})

        filter_by = {"data_uuid": post.data_uuid, "id": not id}
        data, pagination_parameters.item_count = Post.get(
            args, pagination_parameters.page, pagination_parameters.page_size, filter_by=filter_by
        )
        return data


@bp.route('/posts/<int:id>/transform')
class PostsTransformById(MethodView):
    @jwt_required
    @bp.arguments(TransformQuerySchema, location="query")
    def get(self, args, id):
        """
        Return the twins of a post with id {id}
        """
        post = Post.query.get(id)
        if not post:
            abort(422, errors={"json": {"id": ["Does not existppp."]}})

        # storage = current_app.config['TATU_SERVER']
        # data = storage.fetch(post.data_uuid)

        # transformer = args["step"]
        # if transformer == "split":
        #     return Split.process(data)
        # else:
        #     abort(422, errors={"json": {"step": ["Does not exist."]}})


@bp.route("/posts/<string:uuid>")
class PostsOnDemand(MethodView):
    @jwt_required
    @bp.response(PostBaseSchema)
    def post(self, uuid):
        """
        Create a new Post on demand.
        """
        storage = current_app.config['TATU_SERVER']
        data = storage.fetch(uuid)
        if data is None:
            abort(
                422, errors={"json": {"OnDemand": [f"Data {uuid} was not cached nor uploaded, so it does not exist!"]}}
            )

        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        if logged_user.posts.filter_by(data_uuid=uuid).first():
            abort(422, errors={
                "json": {"OnDemand": ["Dataset already exists!"]}})

        # TODO: refactor duplicate code

        name = "←".join([step["desc"]["name"] for step in reversed(data.history) or "No Name"])

        # noinspection PyArgumentList
        post = Post(author=logged_user,
                    data_uuid=uuid,
                    name=name,
                    description="Title and description automatically generated."
                    )
        duuid = Root.uuid
        for step in data.history:
            dic = {"label": duuid.id, "name": step["desc"]["name"], "help": str(step), "stored": True}  # TODO: stored is useless
            db.session.add(Transformation(**dic, post=post))
            duuid *= UUID(step["id"])

        db.session.add(post)
        db.session.commit()

        return post

    @jwt_required
    @bp.response(PostBaseSchema)
    def get(self, uuid):
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        post = logged_user.posts.filter_by(data_uuid=uuid).first()
        if not post:
            abort(422, errors={
                "json": {"OnDemand": ["Dataset does not exist!"]}})
        return post
