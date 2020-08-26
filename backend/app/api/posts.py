from flask import current_app
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_smorest import abort
from pjdata.content.specialdata import UUIDData

from app import db
from app.models import User, Post
from app.schemas import PostQuerySchema, PostBaseSchema, PostFilesSchema, PostEditSchema, CommentBaseSchema
from cururu.persistence import DuplicateEntryException
from pjdata.creation import read_arff
from . import bp


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
            full_path = current_app.config['TMP_FOLDER'] + str(uuid.uuid4())
            try:
                file.save(full_path)
                _, data, name, description = read_arff(full_path)
                if logged_user.posts.filter_by(data_uuid=data.id).first():
                    abort(422, errors={
                        "json": {"Upload": ["Dataset already exists!"]}})
                post = Post(author=logged_user, data_uuid=data.id,
                            name=name, description=description)
                db.session.add(post)
                posts.append(post)
                storage.store(data)
            except DuplicateEntryException:
                print('Duplicate! Ignored.')

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
    @bp.response(CommentBaseSchema(many=True))
    @bp.paginate()
    def get(self, pagination_parameters, id):
        """
        Return the comments of a post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={"json": {"id": ["Does not exist."]}})

        comments = post.comments
        pagination_parameters.item_count = comments.count()

        return comments

    @jwt_required
    @bp.arguments(CommentBaseSchema)
    @bp.response(code=201)
    def post(self, args, id):
        """
        Create a new comment for the post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={"json": {"id": ["Does not exist."]}})

        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        post.add_comment(text=args['text'], author=logged_user)


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

        uuid = post.data_uuid
        storage = current_app.config['CURURU_SERVER']
        data = storage.fetch(UUIDData(uuid))
        lst = []
        # TODO: show uuid along with post name in the web interface
        for transformer in reversed(data.history[1:]):  # Discards data birth (e.g. File).
            uuid = uuid / transformer  # Revert to previous uuid.
            data = storage.fetch(UUIDData(uuid))
            dic = {"uuid": uuid, "transformation": transformer.name, "help": transformer, "exist": data is not None}
            lst.append(dic)
        return reversed(lst)


@bp.route('/posts/<int:id>/metafeatures')
class PostsMetafeaturesById(MethodView):
    @jwt_required
    @bp.response(code=200)
    def get(self, id):
        """
        Return the metafeatures of a dataset of a post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={"json": {"id": ["Does not exist."]}})

        # uuid = post.data_uuid
        # TODO


@bp.route('/posts/<int:id>/twins')
class PostTwinsfeaturesById(MethodView):
    @jwt_required
    @bp.response(code=200)
    def get(self, id):
        """
        Return the metafeatures of a dataset of a post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={"json": {"id": ["Does not exist."]}})

        # uuid = post.data_uuid
        # TODO
