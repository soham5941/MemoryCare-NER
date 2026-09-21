"""Input validation and small text helpers for the NER service.

The service intentionally keeps the original text unchanged so entity offsets
always point to the exact characters supplied by the client.
"""

from __future__ import annotations

import re
from typing import Final


MAX_INPUT_LENGTH: Final[int] = 20_000


class TextValidationError(ValueError):
    """Raised when a request text cannot be safely processed by the demo."""


class TextTooLongError(TextValidationError):
    """Raised when submitted text exceeds the deliberate demo input limit."""


def validate_text(value: object, *, max_length: int = MAX_INPUT_LENGTH) -> str:
    """Validate and return submitted text without changing its character offsets."""
    if not isinstance(value, str):
        raise TextValidationError("The 'text' field must be a string.")

    if not value.strip():
        raise TextValidationError("Text must not be empty.")

    if len(value) > max_length:
        raise TextTooLongError(
            f"Text exceeds the maximum length of {max_length} characters."
        )

    return value


def normalized_entity_key(text: str) -> str:
    """Create a comparison key without altering the text returned to clients."""
    return re.sub(r"\s+", " ", text.strip()).casefold()
