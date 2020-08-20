from . import bp
from app import db
from app.schemas import PostQuerySchema, PostBaseSchema, PostFilesSchema, PostEditSchema
from app.models import User, Post
from flask import current_app
from flask.views import MethodView
from flask_smorest import abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from cururu.persistence import DuplicateEntryException
from cururu.pickleserver import PickleServer
# from pjdata.content.specialdata import UUIDData
from pjdata.data_creation import read_arff
import uuid


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
        # TODO:Get files from front end and store in cururu
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        files = args['files']
        posts = []

        for file in files:
            full_path = current_app.config['TMP_FOLDER'] + str(uuid.uuid4())
            try:
                file.save(full_path)
                data = read_arff(full_path)[1]
                # TODO: Get the name and description from arff and insert into instance post bellow #name=..., body=...
                post = Post(author=logged_user, data_uuid=str(data.uuid))
                db.session.add(post)
                posts.append(post)
                PickleServer().store(data)
            except DuplicateEntryException:
                print('Duplicate! Ignored.')

        db.session.commit()

        return posts


@bp.route('/posts/<string:uuid>')
class PostsById(MethodView):
    @bp.response(PostBaseSchema)
    def get(self, uuid):
        """
        Show info about the post with uuid {uuid}
        """
        post = Post.get_by_uuid(uuid)
        if not post or not post.active:
            abort(422, errors={"json": {"uuid": ["Does not exist."]}})
        return post

    @jwt_required
    @bp.arguments(PostEditSchema)
    @bp.response(code=200)
    def put(self, args, uuid):
        """
        Edit post with uuid {uuid}
        """
        logged_user = User.get_by_username(get_jwt_identity())
        post = Post.get_by_uuid(uuid)

        if not post or not post.active:
            abort(422, errors={"json": {"uuid": ["Does not exist."]}})

        if not logged_user.is_admin():
            if logged_user != post.author:
                abort(422, errors={
                      "json": {"uuid": ["You can only edit your own datasets."]}})

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


@bp.route('/posts/<int:id>/download')
class PostsDownloadCountById(MethodView):
    @jwt_required
    @bp.response(code=200)
    def post(self, id):
        """
        Favorite/unfavorite post with id {id}
        """
        post = Post.query.get(id)
        if not post or not post.active:
            abort(422, errors={"json": {"id": ["Does not exist."]}})

        post.downloads += 1
