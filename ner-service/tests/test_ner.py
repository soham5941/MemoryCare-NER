"""Basic behavioral tests for the MemoryCare NER MVP."""

from __future__ import annotations

from pathlib import Path
import sys
import unittest

# Permit both `python -m unittest` inside ner-service and discovery from the
# project root, whose Python import path does not otherwise include this folder.
SERVICE_ROOT = Path(__file__).resolve().parents[1]
if str(SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVICE_ROOT))

from app import create_app
from nlp.ner_engine import NerEngine


class NerEngineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = NerEngine()

    def test_detects_symptom(self) -> None:
        entities = self.engine.analyze("The individual reports memory loss.")
        self.assertEqual([entity["label"] for entity in entities], ["SYMPTOM"])
        self.assertEqual(entities[0]["text"], "memory loss")

    def test_detects_medication_case_insensitively(self) -> None:
        entities = self.engine.analyze("They are currently taking Donepezil.")
        self.assertEqual(entities[0]["label"], "MEDICATION")
        self.assertEqual(entities[0]["text"], "Donepezil")
        self.assertEqual(entities[0]["confidence"], 0.97)

    def test_detects_condition(self) -> None:
        entities = self.engine.analyze("The note mentions hypertension.")
        self.assertEqual(entities[0]["label"], "CONDITION")
        self.assertEqual(entities[0]["text"], "hypertension")

    def test_detects_multiple_entities_in_source_order(self) -> None:
        text = "A 68-year-old reports confusion for six months and takes aspirin. MRI of the brain is planned."
        entities = self.engine.analyze(text)
        labels = [entity["label"] for entity in entities]
        self.assertEqual(
            labels,
            ["AGE", "SYMPTOM", "DURATION", "MEDICATION", "PROCEDURE", "BODY_PART"],
        )
        self.assertEqual([entity["start"] for entity in entities], sorted(entity["start"] for entity in entities))
        for entity in entities:
            self.assertEqual(text[entity["start"] : entity["end"]], entity["text"])

    def test_empty_text_returns_no_entities(self) -> None:
        self.assertEqual(self.engine.analyze("   "), [])

    def test_duplicate_matching_rule_is_deduplicated_but_mentions_remain(self) -> None:
        # Include the same rule twice to emulate an ML/rule hybrid candidate
        # collision at the same span. Two real mentions must still be retained.
        duplicated_engine = NerEngine(rules=(self.engine.rules[0], self.engine.rules[0]))
        entities = duplicated_engine.analyze("Memory loss and memory loss are both mentioned.")
        self.assertEqual(len(entities), 2)
        self.assertEqual([entity["text"] for entity in entities], ["Memory loss", "memory loss"])

    def test_demo_sample_extracts_expected_entities(self) -> None:
        sample = (
            "Patient is a 68-year-old individual reporting progressive memory loss "
            "and increasing confusion over the past six months. Family members "
            "report difficulty remembering recent events. The patient is currently "
            "taking Donepezil. A cognitive assessment and MRI of the brain are planned."
        )
        labels = {entity["label"] for entity in self.engine.analyze(sample)}
        self.assertTrue({"AGE", "SYMPTOM", "DURATION", "MEDICATION", "PROCEDURE", "BODY_PART"}.issubset(labels))


class NerServiceApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = create_app().test_client()

    def test_health_endpoint(self) -> None:
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["status"], "ok")
        self.assertEqual(response.get_json()["mode"], "rule-based-demo")

    def test_analyze_endpoint(self) -> None:
        response = self.client.post("/analyze", json={"text": "Donepezil for memory loss."})
        body = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(body["success"])
        self.assertEqual([entity["label"] for entity in body["entities"]], ["MEDICATION", "SYMPTOM"])

    def test_analyze_rejects_empty_text(self) -> None:
        response = self.client.post("/analyze", json={"text": "  "})
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.get_json()["success"])

    def test_analyze_rejects_overlength_text(self) -> None:
        response = self.client.post("/analyze", json={"text": "a" * 20_001})
        self.assertEqual(response.status_code, 413)
        self.assertFalse(response.get_json()["success"])


if __name__ == "__main__":
    unittest.main()
