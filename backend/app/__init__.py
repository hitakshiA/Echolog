import os
import time

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from sqlalchemy import text

from app.common.error_handlers import register_error_handlers
from app.common.logging import configure_logging
from app.common.middleware import register_middleware
from app.config import config_map
from app.extensions import db, migrate

_start_time = time.time()


def create_app(config_name: str | None = None) -> Flask:
    """Application factory: creates and configures the Flask app."""
    load_dotenv()
    configure_logging()

    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_map[config_name])

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    with app.app_context():
        from app.domain import models  # noqa: F401

    register_error_handlers(app)
    register_middleware(app)
    _register_blueprints(app)
    _register_health(app)

    return app


def _register_blueprints(app: Flask) -> None:
    from app.api.analysis.routes import analysis_bp
    from app.api.analytics.routes import analytics_bp
    from app.api.feedback.routes import feedback_bp

    app.register_blueprint(feedback_bp, url_prefix="/api/feedback")
    app.register_blueprint(analysis_bp, url_prefix="/api/analysis")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")


def _register_health(app: Flask) -> None:
    @app.route("/api/health", methods=["GET"])
    def health_check():
        db_ok = True
        try:
            db.session.execute(text("SELECT 1"))
        except Exception:
            db_ok = False

        uptime_seconds = round(time.time() - _start_time)

        return {
            "status": "healthy" if db_ok else "unhealthy",
            "database": "connected" if db_ok else "disconnected",
            "version": "0.1.0",
            "uptime_seconds": uptime_seconds,
        }, 200 if db_ok else 503
