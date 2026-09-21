# Future model integration

## Current MVP

This directory intentionally contains no trained model. MemoryCare NER v0.1
uses a lightweight, deterministic rule-based extractor in `nlp/`. The rules
are designed for a fictional demo and are not a clinically validated medical
ontology or medical AI model.

## Future version

A future iteration can place a versioned, appropriately licensed healthcare
NER model and its metadata here. The intended pipeline is:

1. Select an appropriate de-identified healthcare NER dataset and document
   its license and intended use.
2. Train and evaluate a model with held-out data, including per-label metrics.
3. Add bias, privacy, and clinical-safety review before any real-world use.
4. Have `NerEngine` combine or replace deterministic candidates while keeping
   the public API response shape stable.

No model in this project should be represented as diagnostic, treatment, or
clinical-decision software.
