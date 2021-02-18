from app import db, jwt
from . import bp
from flask import jsonify
from flask_smorest import abort


@bp.app_errorhandler(404)
def not_found_error(error):
    return jsonify(errors={"json": {"url": ["Does not exist."]}}), 404


@bp.app_errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify(errors={"json": {"server": ["Internal error."]}}), 500


@bp.app_errorhandler(429)
def too_many_requests(error):
    return jsonify(errors={"json": {"server": ["Too many requests."]}}), 429


@jwt.revoked_token_loader
def revoked_token_callback():
    return jsonify(errors={"json": {"token": ["Your token is invalid."]}}), 401


@jwt.invalid_token_loader
def invalid_token_callback(invalid_token):
    return jsonify(errors={"json": {"token": ["Your token is invalid."]}}), 401


@jwt.expired_token_loader
def expired_token_callback(expired_token):
    return jsonify(errors={"json": {"token": ["Your token has expired."]}}), 401


class HTTPAbort:
    @staticmethod
    def not_authorized():
        """
        Called when the logged user does not have access to some service
        """
        return abort(422, errors={
            "json": {"username": ["Access denied."]}})

    @staticmethod
    def not_possible(field="username", complement=""):
        """
        Called when the action is not possible
        """
        return abort(422, errors={
            "json": {field: ["Not possible." + complement]}})

    @staticmethod
    def not_found(field="id"):
        """
        Called when the provided field does not exist
        """
        return abort(422, errors={"json": {field: ["Not found."]}})

    @staticmethod
    def field_invalid(field="key"):
        """
        Called when the provided field is invalid
        """
        return abort(422, errors={"json": {field: ["Invalid."]}})

    @staticmethod
    def field_wrong(field="password"):
        """
        Called when the provided field is wrong
        """
        return abort(422, errors={"json": {field: ["Wrong data."]}})

    @staticmethod
    def key_expired():
        """
        Called when logged user is providing an expired key
        """
        return abort(422, errors={"json": {"key": [
            "Expired."]}})

    @staticmethod
    def email_already_confirmed():
        """
        Called when logged user is trying to confirm an email already confirmed
        """
        return abort(422, errors={"json": {"email": [
            "Already confirmed."]}})

    @staticmethod
    def email_not_confirmed():
        """
        Called when logged user is trying to access a service but his email was not confirmed yet
        """
        return abort(422, errors={"json": {"email": [
            "Not confirmed."]}})

    @staticmethod
    def unexpected_error():
        """
        Called when logged user is trying to access a service but his email was not confirmed yet
        """
        return abort(422, errors={"json": {"error": [
            "Unexpected error."]}})
