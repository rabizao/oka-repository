from app import jwt
from app.errors.handlers import HTTPAbort
from . import bp
from app.models import User, Token
from app.schemas import UserLoginSchema, LoginResponseSchema, ApiTokenSchema
from flask.views import MethodView
from flask_jwt_extended import (
    create_access_token, get_jti, get_jwt, get_jwt_identity
)


@jwt.token_in_blocklist_loader
def check_if_token_in_blocklist(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    return Token.is_jti_blocklisted(jti)


@bp.route('/auth/login')
class Login(MethodView):
    @bp.arguments(UserLoginSchema)
    @bp.response(201, LoginResponseSchema)
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
    @bp.response(203)
    def delete(self):
        """Revoke access token"""
        jti = get_jwt()['jti']
        user = User.get_by_username(get_jwt_identity())
        user.set_revoked_jti_store(jti, True)


@bp.route('/auth/create-api-token')
class CreateApiToken(MethodView):
    @bp.auth_required
    @bp.response(201, ApiTokenSchema)
    def post(self):
        """Generate a long-term token"""
        username = get_jwt_identity()
        logged_user = User.get_by_username(username)
        access_token = create_access_token(username, expires_delta=False)
        access_jti = get_jti(encoded_token=access_token)
        logged_user.set_revoked_jti_store(access_jti, False, long_term=True)

        return {'api_token': access_token}


@bp.route('/auth/revoke-all-tokens')
class RevokeAllTokens(MethodView):
    @bp.auth_required
    @bp.response(203)
    def delete(self):
        """Revoke all tokens"""
        logged_user = User.get_by_username(get_jwt_identity())
        logged_user.revoke_all_tokens()
