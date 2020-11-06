#!/usr/bin/env python
from app import celery, create_app  # noqa: F401
from app.config import Config

app = create_app(config_class=Config)
app.app_context().push()
