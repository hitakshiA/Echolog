import structlog
from flask import Flask
from werkzeug.exceptions import HTTPException

logger = structlog.get_logger()


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(400)
    def bad_request(error):
        logger.warning("bad_request", error=str(error))
        return {
            "error": {
                "code": "BAD_REQUEST",
                "message": str(error),
                "details": {},
            }
        }, 400

    @app.errorhandler(404)
    def not_found(error):
        return {
            "error": {
                "code": "NOT_FOUND",
                "message": "The requested resource was not found",
                "details": {},
            }
        }, 404

    @app.errorhandler(422)
    def unprocessable(error):
        return {
            "error": {
                "code": "VALIDATION_ERROR",
                "message": str(error),
                "details": {},
            }
        }, 422

    @app.errorhandler(500)
    def internal_error(error):
        logger.error("internal_server_error", error=str(error))
        return {
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": {},
            }
        }, 500

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return {
            "error": {
                "code": error.name.upper().replace(" ", "_"),
                "message": error.description,
                "details": {},
            }
        }, error.code
