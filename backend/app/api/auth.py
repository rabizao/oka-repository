from app import jwt
from . import bp
from app.models import User, Token
from app.schemas import UserLoginSchema, LoginResponseSchema, ApiTokenSchema
from flask import jsonify
from flask.views import MethodView
from flask_jwt_extended import (
    jwt_required, create_access_token, get_jti, get_raw_jwt, get_jwt_identity
)


@jwt.revoked_token_loader
def revoked_token_callback():
    return jsonify(errors={"json": {"token": ["Your token is invalid."]}}), 401


@jwt.invalid_token_loader
def invalid_token_callback(invalid_token):
    return jsonify(errors={"json": {"token": ["Your token is invalid."]}}), 401


@jwt.expired_token_loader
def expired_token_callback(expired_token):
    return jsonify(errors={"json": {"token": ["Your token has expired."]}}), 401


@jwt.token_in_blacklist_loader
def check_if_token_in_blacklist(decrypted_token):
    jti = decrypted_token['jti']
    return Token.is_jti_blacklisted(jti)


@bp.route('/auth/login')
class Login(MethodView):
    @bp.arguments(UserLoginSchema)
    @bp.response(LoginResponseSchema)
    def post(self, args):
        """Login the user"""
        user = User.get_by_username(args['username'])
        access_token = create_access_token(identity=args['username'])
        access_jti = get_jti(encoded_token=access_token)
        user.set_revoked_jti_store(access_jti, False)
        response = {
            'access_token': access_token,
            'id': user.id,
            'username': args['username'],
            'name': user.name
        }

        return response


@bp.route('/auth/logout')
class Logout(MethodView):
    @jwt_required
    @bp.response(code=200)
    def delete(self):
        """Revoke access token"""
        jti = get_raw_jwt()['jti']
        current_user = get_jwt_identity()
        user = User.get_by_username(current_user)
        user.set_revoked_jti_store(jti, True)


@bp.route('/auth/create-api-token')
class CreateApiToken(MethodView):
    @jwt_required
    @bp.response(ApiTokenSchema)
    def post(self):
        """Generate a long-term token"""
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)

        access_token = create_access_token(username, expires_delta=False)
        access_jti = get_jti(encoded_token=access_token)
        logged_user.set_revoked_jti_store(access_jti, False, long_term=True)

        return jsonify({'api_token': access_token}), 201


@bp.route('/auth/revoke-all-tokens')
class RevokeAllTokens(MethodView):
    @jwt_required
    @bp.response(code=200)
    def delete(self):
        """Revoke all tokens"""
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        logged_user.revoke_all_tokens()
