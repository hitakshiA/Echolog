import os

from dotenv import load_dotenv
from flask import Flask

from app.config import config_map
from app.extensions import db, migrate


def create_app(config_name: str | None = None) -> Flask:
    load_dotenv()

    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_map[config_name])

    db.init_app(app)
    migrate.init_app(app, db)

    with app.app_context():
        from app.domain import models  # noqa: F401

    _register_blueprints(app)

    return app


def _register_blueprints(app: Flask) -> None:
    from app.api.feedback.routes import feedback_bp

    app.register_blueprint(feedback_bp, url_prefix="/api/feedback")
