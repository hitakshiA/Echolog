import time
import uuid

import structlog
from flask import Flask, g, request

logger = structlog.get_logger()


def register_middleware(app: Flask) -> None:
    @app.before_request
    def before_request():
        g.request_id = str(uuid.uuid4())
        g.start_time = time.perf_counter()
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=g.request_id)

    @app.after_request
    def after_request(response):
        duration_ms = round((time.perf_counter() - g.start_time) * 1000, 2)
        logger.info(
            "request_completed",
            method=request.method,
            path=request.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
        )
        response.headers["X-Request-ID"] = g.request_id
        return response
