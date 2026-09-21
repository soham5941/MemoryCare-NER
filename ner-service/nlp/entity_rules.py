"""Explainable vocabulary and regular-expression rules for the MVP NER engine."""

from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Final, Iterable


@dataclass(frozen=True)
class EntityRule:
    """One deterministic entity extraction rule.

    ``priority`` resolves a rare collision after confidence and span length are
    considered. It is not exposed through the API.
    """

    label: str
    pattern: str
    confidence: float
    priority: int = 0
    flags: int = re.IGNORECASE

    def finditer(self, text: str) -> Iterable[re.Match[str]]:
        return re.finditer(self.pattern, text, self.flags)


def _phrase_pattern(phrase: str) -> str:
    """Build a word-bounded, whitespace-tolerant pattern for a known phrase."""
    escaped_words = [re.escape(word) for word in phrase.split()]
    return r"(?<!\w)" + r"\s+".join(escaped_words) + r"(?!\w)"


def _phrase_rules(
    label: str, entries: Iterable[tuple[str, float]], *, priority: int
) -> list[EntityRule]:
    return [
        EntityRule(label, _phrase_pattern(phrase), confidence, priority)
        for phrase, confidence in entries
    ]


VOCABULARY_RULES: Final[tuple[EntityRule, ...]] = tuple(
    _phrase_rules(
        "SYMPTOM",
        (
            ("memory loss", 0.92),
            ("confusion", 0.91),
            ("headache", 0.90),
            ("dizziness", 0.90),
            ("fatigue", 0.88),
            ("forgetfulness", 0.89),
            ("nausea", 0.89),
            ("difficulty sleeping", 0.90),
            ("loss of appetite", 0.90),
            ("difficulty remembering recent events", 0.89),
        ),
        priority=30,
    )
    + _phrase_rules(
        "CONDITION",
        (
            ("Alzheimer's disease", 0.96),
            ("dementia", 0.94),
            ("diabetes", 0.95),
            ("hypertension", 0.95),
            ("depression", 0.93),
            ("anxiety", 0.92),
        ),
        priority=30,
    )
    + _phrase_rules(
        "MEDICATION",
        (
            ("donepezil", 0.97),
            ("memantine", 0.97),
            ("metformin", 0.97),
            ("aspirin", 0.96),
            ("ibuprofen", 0.96),
        ),
        priority=30,
    )
    + _phrase_rules(
        "PROCEDURE",
        (
            ("cognitive assessment", 0.94),
            ("CT scan", 0.95),
            ("blood test", 0.92),
            ("MRI", 0.95),
        ),
        priority=30,
    )
    + _phrase_rules(
        "BODY_PART",
        (
            ("brain", 0.93),
            ("heart", 0.93),
            ("chest", 0.92),
            ("head", 0.92),
            ("arm", 0.91),
            ("leg", 0.91),
        ),
        priority=20,
    )
    + _phrase_rules(
        "OTHER_MEDICAL",
        (
            ("family history", 0.86),
            ("medical history", 0.86),
            ("blood pressure", 0.90),
            ("vital signs", 0.87),
        ),
        priority=10,
    )
)


REGEX_RULES: Final[tuple[EntityRule, ...]] = (
    EntityRule(
        "AGE",
        r"(?<!\w)\d{1,3}\s*-\s*year\s*-\s*old(?!\w)",
        0.99,
        priority=40,
    ),
    EntityRule(
        "AGE",
        r"(?<!\w)\d{1,3}\s+years?\s+old(?!\w)",
        0.99,
        priority=40,
    ),
    EntityRule(
        "DURATION",
        r"(?<!\w)(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|"
        r"eleven|twelve)\s+(?:days?|weeks?|months?|years?)(?!\w)",
        0.89,
        priority=35,
    ),
    EntityRule(
        "DATE",
        r"(?<!\w)(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|"
        r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
        r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|"
        r"Dec(?:ember)?)\s+\d{1,2}(?:,\s*\d{4})?|"
        r"\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|"
        r"Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|"
        r"Nov(?:ember)?|Dec(?:ember)?)(?:\s+\d{4})?)(?!\w)",
        0.90,
        priority=35,
    ),
    EntityRule(
        "PERSON",
        r"(?<!\w)(?:Dr|Mr|Mrs|Ms)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}(?!\w)",
        0.78,
        priority=15,
        flags=0,
    ),
)


ALL_RULES: Final[tuple[EntityRule, ...]] = VOCABULARY_RULES + REGEX_RULES
