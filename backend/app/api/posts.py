from datetime import datetime
from idict import idict
from idict.core.idict_ import Idict
from idict.persistence.sqla import SQLA

from app import db
from app.errors.handlers import HTTPAbort
from app.models import Comment, Post, User
from app.schemas import (CommentBaseSchema, CommentQuerySchema, PostBaseSchema,
                         PostEditSchema, PostFilesSchema, PostQuerySchema, PostSimplifiedSchema,
                         RunSchema, TaskBaseSchema, UserBaseSchema, VisualizeQuerySchema,
                         PostActivateSchema)
from flask import current_app
from flask.views import MethodView
from flask_jwt_extended import get_jwt_identity
from idict.function.dataset import arff2df, df2Xy

from . import bp
from .tasks import create_post
from app.functions import scatter_macro, histogram_macro


@bp.route("/posts")
class Posts(MethodView):
    @bp.auth_required
    @bp.arguments(PostQuerySchema, location="query")
    @bp.response(200, PostSimplifiedSchema(many=True))
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
    @bp.response(201, TaskBaseSchema)
    def post(self, argsFiles):
        """
        Create a new post to the logged user
        """
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)

        storage = SQLA(
            current_app.config['DATA_URL'], user_id=username)

        for file in argsFiles['files']:
            data = Idict(arff=file.read().decode()) >> arff2df >> [[storage]]
            oid = data.id
            if oid in storage:
                HTTPAbort.already_uploaded()
            desc = data.description if "_description" in data else "No description"
            new_post = create_post(logged_user, oid, data.name, desc)
            if new_post["code"] == "error":
                HTTPAbort.already_uploaded()
            task = logged_user.launch_task('run',
                                           "Processing your uploaded files",
                                           [oid, username])
        db.session.commit()
        return task


@bp.route('/posts/<int:id>')
class PostsById(MethodView):
    @bp.auth_required
    @bp.response(200, PostBaseSchema)
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
    @bp.response(201)
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
        # storage = SQLA(current_app.config['DATA_URL'],
        #                user_id=post.author.username)
        # data = idict(post.data_uuid, storage)
        # for key, value in args.items():
        #     setattr(data, key, value)
        # data >> [[storage]]
        db.session.commit()

    @bp.auth_required
    @bp.response(203)
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

        storage = SQLA(
            current_app.config['DATA_URL'], user_id=logged_user.username)
        del storage[post.data_uuid]
        db.session.delete(post)
        db.session.commit()


@bp.route('/posts/<int:id>/collaborators')
class PostsCollaboratorsById(MethodView):
    @bp.auth_required
    @bp.arguments(UserBaseSchema(only=["username"]))
    @bp.response(201)
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
    @bp.response(201)
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
    @bp.response(201)
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

        metas = ["classification", "regression", "clustering", "other_tasks", "life_sciences",
                 "physical_sciences", "engineering", "social", "business", "finances", "astronomy", "quantum_mechanics",
                 "medical", "financial", "other_domains", "categorical", "numerical", "text", "images", "time_series",
                 "other_features"]

        n_meta = 0
        for meta in metas:
            if getattr(post, meta):
                n_meta = n_meta + 1

        if n_meta < 3 or n_meta > 5:
            HTTPAbort.not_possible(
                "metas", complement="Post must have between 3 and 5 metafeatures before publish")

        post.public = True
        post.publish_timestamp = datetime.utcnow()
        db.session.commit()


@bp.route('/posts/<int:id>/comments')
class PostsCommentsById(MethodView):
    @bp.auth_required
    @bp.arguments(CommentQuerySchema, location="query")
    @bp.response(200, CommentBaseSchema(many=True))
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
    @bp.response(201, CommentBaseSchema)
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
    @bp.arguments(VisualizeQuerySchema)
    @bp.response(201, TaskBaseSchema)
    def post(self, args, id):
        """
        Evaluate the data for visualization of the dataset of the post with id {id}
        """
        # username = get_jwt_identity()
        # logged_user = User.get_by_username(username)
        # post = Post.query.get(id)

        # if not post or not post.active:
        #     HTTPAbort.not_found()

        # if not logged_user.has_access(post):
        #     HTTPAbort.not_authorized()

        # storage = SQLA(
        #     current_app.config['DATA_URL'], user_id=post.author.username)
        # data = idict(post.data_uuid, storage)

        # # if args["plot"] == "scatter":
        # #     data >> scatter_macro

        # task = logged_user.launch_task('run',
        #                                "Processing your visualization request",
        #                                [post.id, username])
        # db.session.commit()
        # return task

    @bp.auth_required
    @bp.arguments(VisualizeQuerySchema, location="query")
    @bp.response(200)
    def get(self, args, id):
        """
        Return the data for visualization of the dataset of the post with id {id}
        """

        logged_user = User.get_by_username(get_jwt_identity())
        post = Post.query.get(id)

        if not post or not post.active:
            HTTPAbort.not_found()

        if not logged_user.has_access(post):
            HTTPAbort.not_authorized()

        storage = SQLA(
            current_app.config['DATA_URL'], user_id=post.author.username)
        data = idict(post.data_uuid, storage)

        result = {}

        if args["plot"] == "scatter":
            data = data >> df2Xy >> scatter_macro(
                colx=args["x"], coly=args["y"]) >> [storage]
            result = data.scatterplot
        if args["plot"] == "histogram":
            data = data >> df2Xy >> histogram_macro(col=args["x"]) >> [storage]
            result = data.histogram
        if not result:
            HTTPAbort.not_found()

        return result


@bp.route('/posts/<int:id>/twins')
class PostsTwinsById(MethodView):
    @bp.auth_required
    @bp.arguments(PostQuerySchema, location="query")
    @bp.response(200, PostSimplifiedSchema(many=True))
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


# @bp.route('/posts/<int:id>/run')
# class PostsTransformById(MethodView):
#     @bp.auth_required
#     @bp.arguments(RunSchema)
#     @bp.response(201, TaskBaseSchema)
#     def post(self, args, id):
#         """
#         Return the twins of a post with id {id}
#         """
#         username = get_jwt_identity()
#         logged_user = User.get_by_username(username)
#         post = Post.query.get(id)

#         if not post or not post.active:
#             HTTPAbort.not_found()

#         if not logged_user.has_access(post):
#             HTTPAbort.not_authorized()

#         for key, value in args["parameters"].items():
#             try:
#                 args["parameters"][key] = int(value)
#             except ValueError:
#                 pass

#         step_asdict = {
#             'id': post.data_uuid,
#             'desc': {
#                 'name': args["algorithm"].capitalize(),
#                 'path': f'kururu.tool.{args["category"]}.{args["algorithm"]}',
#                 'config': args["parameters"]
#             }
#         }

#         task = logged_user.launch_task('run_step', 'Processing your simulation',
#                                        [post.id, step_asdict, username])
#         db.session.commit()
#         return task


# noinspection PyArgumentList
@bp.route("/posts/activate")
class PostsActivate(MethodView):
    @bp.auth_required
    @bp.arguments(PostActivateSchema)
    @bp.response(201)
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
