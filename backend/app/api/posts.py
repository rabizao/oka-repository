import json
import uuid as u
from datetime import datetime

from flask import current_app
from flask.views import MethodView
from flask_jwt_extended import get_jwt_identity
from flask_smorest import abort
from kururu.tool.enhancement.attribute.binarize import Binarize
from kururu.tool.enhancement.instance.sampling.under.sample import Sample_

from app import db
from app.errors.handlers import HTTPAbort
from app.models import Comment, Post, User
from app.schemas import (CommentBaseSchema, CommentQuerySchema, PostBaseSchema,
                         PostEditSchema, PostFilesSchema, PostQuerySchema,
                         RunSchema, TaskBaseSchema, UserBaseSchema, VisualizeQuerySchema, PostCreateSchema,
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
    @bp.auth_required
    @bp.arguments(PostQuerySchema, location="query")
    @bp.response(PostBaseSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters):
        """
        Show all posts
        """
        logged_user = User.get_by_username(get_jwt_identity())

        data, pagination_parameters.item_count = Post.get(args, pagination_parameters.page,
                                                          pagination_parameters.page_size,
                                                          query=logged_user.accessible_posts())
        return data

    @bp.auth_required
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

    @bp.auth_required
    @bp.arguments(PostCreateSchema)
    @bp.response(code=200)
    def put(self, args):
        """
        Create inactive post (and without Data for a while), and parents.
        """
        logged_user = User.get_by_username(get_jwt_identity())
        obj = create_post(
            logged_user, args["data_uuid"], args["name"], args["description"], active=False, info=args["info"])
        if obj["code"] != "success":
            abort(422, errors={"json": {"data_uuid": obj["message"]}})


# noinspection PyArgumentList
@bp.route("/posts/activate")
class PostsActivate(MethodView):
    @bp.auth_required
    @bp.arguments(PostActivateSchema)
    @bp.response(code=200)
    def put(self, args):
        """
        Activate post with id {id}
        """
        logged_user = User.get_by_username(get_jwt_identity())
        post = Post.query.filter_by(
            data_uuid=args["data_uuid"], user_id=logged_user.id).first()
        if not post:
            HTTPAbort.not_found(field="data_uuid")
        post.active = True
        db.session.commit()


@bp.route('/posts/<int:id>')
class PostsById(MethodView):
    @bp.auth_required
    @bp.response(PostBaseSchema)
    def get(self, id):
        """
        Show info about the post with id {id}
        """
        logged_user = User.get_by_username(get_jwt_identity())
        post = Post.query.get(id)

        if not post or not post.active:
            HTTPAbort.not_found()

        if not logged_user.has_access(post):
            HTTPAbort.not_authorized()

        return post

    @bp.auth_required
    @bp.arguments(PostEditSchema)
    @bp.response(code=200)
    def put(self, args, id):
        """
        Edit post with id {id}
        """
        logged_user = User.get_by_username(get_jwt_identity())
        post = Post.query.get(id)

        if not post or not post.active:
            HTTPAbort.not_found()

        if post.public:
            HTTPAbort.not_possible(
                field="id", complement="Public posts can not be edited.")

        if not logged_user.is_admin():
            if logged_user != post.author:
                HTTPAbort.not_authorized()

        post.update(args)
        db.session.commit()

    @bp.auth_required
    @bp.response(code=200)
    def delete(self, id):
        """
        Delete post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            HTTPAbort.not_found()

        if post.public:
            HTTPAbort.not_possible(
                field="id", complement="Public posts can not be deleted.")

        logged_user = User.get_by_username(get_jwt_identity())
        if post.author != logged_user:
            HTTPAbort.not_authorized()

        post.active = False
        db.session.commit()


@bp.route('/posts/<int:id>/collaborators')
class PostsCollaboratorsById(MethodView):
    @bp.auth_required
    @bp.arguments(UserBaseSchema(only=["username"]))
    @bp.response(code=201)
    def post(self, args, id):
        """
        Grant/Deny access to a collaborator to the post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            HTTPAbort.not_found()

        collaborator = User.get_by_username(args["username"])
        if not collaborator:
            HTTPAbort.not_found(field="username")

        logged_user = User.get_by_username(get_jwt_identity())

        if post.author == collaborator:
            HTTPAbort.not_possible()

        if not post.author == logged_user:
            HTTPAbort.not_possible(
                complement="Only the author can invite collaborators to the post.")

        if collaborator.has_access(post):
            collaborator.deny_access(post)
        else:
            collaborator.grant_access(post)
        db.session.commit()


@bp.route('/posts/<int:id>/favorite')
class PostsFavoriteById(MethodView):
    @bp.auth_required
    @bp.response(code=200)
    def post(self, id):
        """
        Favorite/unfavorite post with id {id}
        """
        logged_user = User.get_by_username(get_jwt_identity())
        post = Post.query.get(id)

        if not post or not post.active:
            HTTPAbort.not_found()

        if not logged_user.has_access(post):
            HTTPAbort.not_authorized()

        if logged_user.has_favorited(post):
            logged_user.unfavorite(post)
        else:
            logged_user.favorite(post)


@bp.route('/posts/<int:id>/publish')
class PostsPublishById(MethodView):
    @bp.auth_required
    @bp.response(code=200)
    def post(self, id):
        """
        Publish post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            HTTPAbort.not_found()

        if post.public:
            HTTPAbort.not_possible(
                field="id", complement="The post is already published.")

        logged_user = User.get_by_username(get_jwt_identity())
        if post.author != logged_user:
            HTTPAbort.not_authorized()

        # TODO: Verify if the post has all classification variables before next steps

        post.public = True
        post.publish_timestamp = datetime.utcnow()
        db.session.commit()


@bp.route('/posts/<int:id>/comments')
class PostsCommentsById(MethodView):
    @bp.auth_required
    @bp.arguments(CommentQuerySchema, location="query")
    @bp.response(CommentBaseSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, id):
        """
        Return the comments of a post with id {id}
        """
        logged_user = User.get_by_username(get_jwt_identity())
        post = Post.query.get(id)

        if not post or not post.active:
            HTTPAbort.not_found()

        if not logged_user.has_access(post):
            HTTPAbort.not_authorized()

        order_by = getattr(Comment.timestamp, args['order_by'])()
        query = post.comments
        args.pop('order_by', None)
        data, pagination_parameters.item_count = Post.get(args, pagination_parameters.page,
                                                          pagination_parameters.page_size,
                                                          query=query, order_by=order_by)
        return data

    @bp.auth_required
    @bp.arguments(CommentBaseSchema)
    @bp.response(CommentBaseSchema)
    def post(self, args, id):
        """
        Create a new comment for the post with id {id}
        """
        logged_user = User.get_by_username(get_jwt_identity())
        post = Post.query.get(id)

        if not post or not post.active:
            HTTPAbort.not_found()

        if not logged_user.has_access(post):
            HTTPAbort.not_authorized()

        comment = post.add_comment(text=args['text'], author=logged_user)

        return comment


@bp.route('/posts/<int:id>/visualize')
class PostsVisualizeById(MethodView):
    @bp.auth_required
    @bp.arguments(VisualizeQuerySchema, location="query")
    def get(self, args, id):
        """
        Return the visualize of a dataset of a post with id {id}
        """
        logged_user = User.get_by_username(get_jwt_identity())
        post = Post.query.get(id)

        if not post or not post.active:
            HTTPAbort.not_found()

        if not logged_user.has_access(post):
            HTTPAbort.not_authorized()

        tatu = current_app.config['TATU_SERVER']
        data = tatu.fetch(post.data_uuid, lazy=False)
        data_modified = data >> Sample_(n=min(len(data.X), 500)) * Binarize

        datas = []
        for m in data_modified.Yt[0]:
            inner = []
            for k in range(len(data_modified.X)):
                if m == data_modified.Y[k]:
                    inner.append(
                        {
                            "x": data_modified.X[k, args['x']],
                            "y": data_modified.X[k, args['y']],
                        })
            datas.append(
                {
                    "id": m,
                    "data": inner
                })

        return json.dumps(datas)


@bp.route('/posts/<int:id>/twins')
class PostsTwinsById(MethodView):
    @bp.auth_required
    @bp.arguments(PostQuerySchema, location="query")
    @bp.response(PostBaseSchema(many=True))
    @bp.paginate()
    def get(self, args, pagination_parameters, id):
        """
        Return the twins of a post with id {id}
        """
        post = Post.query.get(id)
        if not post:
            HTTPAbort.not_found()

        logged_user = User.get_by_username(get_jwt_identity())

        data, pagination_parameters.item_count = Post.get(args, pagination_parameters.page,
                                                          pagination_parameters.page_size,
                                                          query=logged_user.accessible_twin_posts(post))
        return data


@bp.route('/posts/<int:id>/run')
class PostsTransformById(MethodView):
    @bp.auth_required
    @bp.arguments(RunSchema)
    @bp.response(TaskBaseSchema)
    def post(self, args, id):
        """
        Return the twins of a post with id {id}
        """
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        post = Post.query.get(id)

        if not post or not post.active:
            HTTPAbort.not_found()

        if not logged_user.has_access(post):
            HTTPAbort.not_authorized()

        for key, value in args["parameters"].items():
            try:
                args["parameters"][key] = int(value)
            except ValueError:
                pass

        step_asdict = {
            'id': post.data_uuid,
            'desc': {
                'name': args["algorithm"].capitalize(),
                'path': f'kururu.tool.{args["category"]}.{args["algorithm"]}',
                'config': args["parameters"]
            }
        }

        task = logged_user.launch_task('run_step', 'Processing your simulation',
                                       [post.id, step_asdict, username])
        db.session.commit()
        return task
