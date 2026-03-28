import os

from dotenv import load_dotenv
from flask import Flask

from app.common.error_handlers import register_error_handlers
from app.common.logging import configure_logging
from app.common.middleware import register_middleware
from app.config import config_map
from app.extensions import db, migrate


def create_app(config_name: str | None = None) -> Flask:
    load_dotenv()
    configure_logging()

    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_map[config_name])

    db.init_app(app)
    migrate.init_app(app, db)

    with app.app_context():
        from app.domain import models  # noqa: F401

    register_error_handlers(app)
    register_middleware(app)
    _register_blueprints(app)

    return app


def _register_blueprints(app: Flask) -> None:
    from app.api.analysis.routes import analysis_bp
    from app.api.analytics.routes import analytics_bp
    from app.api.feedback.routes import feedback_bp

    app.register_blueprint(feedback_bp, url_prefix="/api/feedback")
    app.register_blueprint(analysis_bp, url_prefix="/api/analysis")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
