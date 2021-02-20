from flask import request

consts = dict(
    ROLE_USER=0,
    ROLE_ADMIN=50
)


def is_browser():
    return True if request.user_agent.browser else False
