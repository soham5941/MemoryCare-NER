"""Flask HTTP API for the MemoryCare deterministic NER demo."""

from __future__ import annotations

import os
from typing import Any

from flask import Flask, jsonify, request
from werkzeug.exceptions import RequestEntityTooLarge

from nlp.ner_engine import NerEngine
from nlp.preprocessing import (
    MAX_INPUT_LENGTH,
    TextTooLongError,
    TextValidationError,
    validate_text,
)


def _error(message: str, status_code: int):
    return jsonify({"success": False, "error": message}), status_code


def create_app() -> Flask:
    """Create the API application so it can also be tested without a server."""
    app = Flask(__name__)
    # This transport limit is intentionally higher than the text limit so API
    # clients receive a clear validation error for normal oversized requests.
    app.config["MAX_CONTENT_LENGTH"] = 1 * 1024 * 1024
    engine = NerEngine()

    @app.get("/health")
    def health():
        return jsonify(
            {
                "status": "ok",
                "service": "MemoryCare NER Python Service",
                "mode": "rule-based-demo",
            }
        )

    @app.post("/analyze")
    def analyze():
        if not request.is_json:
            return _error("Request body must be valid JSON.", 400)

        payload: Any = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return _error("Request body must be a JSON object.", 400)

        try:
            text = validate_text(payload.get("text"), max_length=MAX_INPUT_LENGTH)
        except TextTooLongError as error:
            return _error(str(error), 413)
        except TextValidationError as error:
            return _error(str(error), 400)

        entities = engine.analyze(text)
        return jsonify({"success": True, "entities": entities})

    @app.errorhandler(RequestEntityTooLarge)
    def handle_large_request(_: RequestEntityTooLarge):
        return _error("Request body is too large.", 413)

    @app.errorhandler(404)
    def handle_not_found(_: Any):
        return _error("Endpoint not found.", 404)

    @app.errorhandler(Exception)
    def handle_unexpected_error(error: Exception):
        # Let Flask's development debugger retain normal behavior when it is
        # explicitly enabled; production callers always receive a safe message.
        if app.debug:
            raise error
        app.logger.exception("Unexpected NER service error")
        return _error("Unable to analyze the text at this time.", 500)

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=False)
