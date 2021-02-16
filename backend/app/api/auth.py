from app import jwt
from app.errors.handlers import HTTPAbort
from . import bp
from app.models import User, Token
from app.schemas import UserLoginSchema, LoginResponseSchema, ApiTokenSchema
from flask import jsonify
from flask.views import MethodView
from flask_jwt_extended import (
    create_access_token, get_jti, get_raw_jwt, get_jwt_identity
)


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

        if not user.email_confirmed:
            HTTPAbort.email_not_confirmed()

        access_token = create_access_token(identity=args['username'])
        access_jti = get_jti(encoded_token=access_token)
        user.set_revoked_jti_store(access_jti, False)
        response = {
            'access_token': access_token,
            'id': user.id,
            'username': args['username'],
            'name': user.name,
            'gravatar': user.gravatar(),
        }

        return response


@bp.route('/auth/logout')
class Logout(MethodView):
    @bp.auth_required
    @bp.response(code=200)
    def delete(self):
        """Revoke access token"""
        jti = get_raw_jwt()['jti']
        user = User.get_by_username(get_jwt_identity())
        user.set_revoked_jti_store(jti, True)


@bp.route('/auth/create-api-token')
class CreateApiToken(MethodView):
    @bp.auth_required
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
    @bp.auth_required
    @bp.response(code=200)
    def delete(self):
        """Revoke all tokens"""
        logged_user = User.get_by_username(get_jwt_identity())
        logged_user.revoke_all_tokens()
