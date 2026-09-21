"""Modular deterministic NER engine used by the MemoryCare demo API."""

from __future__ import annotations

from collections.abc import Iterable
from typing import Any

from .entity_rules import ALL_RULES, EntityRule
from .preprocessing import normalized_entity_key


Candidate = dict[str, Any]


class NerEngine:
    """Extract demo healthcare entities using explainable local rules.

    The class deliberately exposes a small ``analyze`` boundary so a future
    trained model can augment its candidates without changing the Flask API.
    """

    def __init__(self, rules: Iterable[EntityRule] = ALL_RULES) -> None:
        self.rules = tuple(rules)

    def analyze(self, text: str) -> list[dict[str, object]]:
        """Return non-overlapping entities sorted by their source position."""
        if not text or not text.strip():
            return []

        candidates = self._collect_candidates(text)
        selected = self._deduplicate_and_resolve_overlaps(candidates)
        return [self._public_entity(candidate) for candidate in selected]

    def _collect_candidates(self, text: str) -> list[Candidate]:
        candidates: list[Candidate] = []
        for rule in self.rules:
            for match in rule.finditer(text):
                start, end = match.span()
                if start == end:
                    continue
                candidates.append(
                    {
                        "text": text[start:end],
                        "label": rule.label,
                        "start": start,
                        "end": end,
                        "confidence": rule.confidence,
                        "priority": rule.priority,
                    }
                )
        return candidates

    @staticmethod
    def _deduplicate_and_resolve_overlaps(
        candidates: Iterable[Candidate],
    ) -> list[Candidate]:
        """Keep the strongest candidate for duplicate or overlapping spans.

        Identical mentions at different positions are intentionally retained.
        We only deduplicate rules that match the same source span. Overlapping
        candidates are ranked deterministically by confidence, span length,
        rule priority, and a stable label/text tie-breaker.
        """
        best_by_span: dict[tuple[int, int], Candidate] = {}
        for candidate in candidates:
            span = (candidate["start"], candidate["end"])
            current = best_by_span.get(span)
            if current is None or NerEngine._preference_key(candidate) > NerEngine._preference_key(current):
                best_by_span[span] = candidate

        ranked = sorted(
            best_by_span.values(),
            key=lambda entity: (
                -float(entity["confidence"]),
                -(int(entity["end"]) - int(entity["start"])),
                -int(entity["priority"]),
                str(entity["label"]),
                normalized_entity_key(str(entity["text"])),
            ),
        )

        selected: list[Candidate] = []
        for candidate in ranked:
            if not any(NerEngine._overlaps(candidate, chosen) for chosen in selected):
                selected.append(candidate)

        return sorted(
            selected,
            key=lambda entity: (int(entity["start"]), int(entity["end"]), str(entity["label"])),
        )

    @staticmethod
    def _preference_key(entity: Candidate) -> tuple[float, int, int, str, str]:
        return (
            float(entity["confidence"]),
            int(entity["end"]) - int(entity["start"]),
            int(entity["priority"]),
            str(entity["label"]),
            normalized_entity_key(str(entity["text"])),
        )

    @staticmethod
    def _overlaps(left: Candidate, right: Candidate) -> bool:
        return int(left["start"]) < int(right["end"]) and int(right["start"]) < int(left["end"])

    @staticmethod
    def _public_entity(entity: Candidate) -> dict[str, object]:
        return {
            "text": entity["text"],
            "label": entity["label"],
            "start": entity["start"],
            "end": entity["end"],
            "confidence": round(float(entity["confidence"]), 2),
        }
