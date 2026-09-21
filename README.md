# MemoryCare NER

MemoryCare NER is a small full-stack demonstration prototype that extracts selected healthcare-related entities from text. It is intended for a college, hackathon, or technical-jury demo: a React dashboard calls an Express API, which calls a Python extraction service.

> **Demo only — MemoryCare NER extracts information from text and is not a medical diagnostic or treatment system. Do not enter real patient data.**

**This repository contains an initial demonstration prototype and is not a clinically validated medical system.**

## Problem and MVP objective

Healthcare notes can contain useful mentions of symptoms, medications, procedures, and timing. This MVP demonstrates the mechanics of extracting and presenting those mentions transparently. It does not diagnose, predict, recommend medication or treatment, make clinical decisions, authenticate users, or store data.

## Features

- Paste or type a healthcare-style note, load fictional sample data, or clear the workspace.
- Analyze text through React → Express → Python REST APIs.
- Extract deterministic demo categories: `PERSON`, `AGE`, `SYMPTOM`, `CONDITION`, `MEDICATION`, `PROCEDURE`, `BODY_PART`, `DATE`, `DURATION`, and `OTHER_MEDICAL`.
- Show entity text, category, confidence, counts, highlighted source text, and a category legend.
- Provide loading, validation, and service-unavailable states without exposing stack traces.
- Avoid persistent storage and do not log submitted note content in normal operation.

## Architecture

```text
React / Vite :5173 → Express API :5000 → Python NER API :8000
```

See [architecture documentation](docs/architecture.md) for responsibilities and the reason Python is isolated.

## Technology stack

- Frontend: React, Vite, HTML, CSS, JavaScript
- API: Node.js, Express, CORS
- Extraction: Python, Flask, rule-based NLP and regular expressions
- Planned ML path: a future validated model can use scikit-learn and/or TensorFlow behind the existing Python service contract.

The current MVP does **not** claim to be a trained medical AI model. Rule-based extraction was selected for a reliable, explainable first demo.

## Folder structure

```text
MemoryCare-NER/
├── frontend/        # React dashboard
├── backend/         # Express browser-facing API
├── ner-service/     # Flask extraction service and tests
├── docs/            # API and architecture notes
├── .env.example
└── package.json
```

## Prerequisites

- Node.js 18 or newer
- npm
- Python 3.10 or newer

## Installation

From the project root, copy `.env.example` to `.env` if you want to change the defaults. No secrets are required.

```bash
npm run install:all
python -m venv .venv
```

Activate the virtual environment, then install the Python service:

```bash
# PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r ner-service/requirements.txt
```

## Run the services

Use three terminals from the project root.

```bash
# Terminal 1 — Python NER, port 8000
python ner-service/app.py
```

```bash
# Terminal 2 — Express, port 5000
npm --prefix backend run dev
```

```bash
# Terminal 3 — React / Vite, port 5173
npm --prefix frontend run dev
```

You can start the two Node services together with `npm run dev`; the Python service remains a separate process by design. Open the Vite URL printed in Terminal 3 (normally `http://localhost:5173`).

## API endpoints

| Service | Endpoint | Purpose |
| --- | --- | --- |
| Express | `GET /api/health` | Backend availability |
| Express | `POST /api/ner/analyze` | Browser-facing analysis endpoint |
| Python | `GET /health` | Extractor availability |
| Python | `POST /analyze` | Internal extraction endpoint |

Full request, response, error, and curl examples are in [docs/api.md](docs/api.md).

## Sample demo input

```text
Patient is a 68-year-old fictional individual reporting progressive memory loss and increasing confusion over the past six months. Family members report difficulty remembering recent events. The individual is currently taking Donepezil. A cognitive assessment and MRI of the brain are planned.
```

Expected demo-style matches include age, memory loss, confusion, six months, Donepezil, cognitive assessment, MRI, and brain. Exact results can vary as the lightweight rules evolve.

## Testing

Run the focused Python test suite:

```bash
python -m unittest discover -s ner-service/tests -v
```

The tests cover symptom, medication, condition, multiple-entity, empty-text, and duplicate handling. For a full local smoke test, start all three services, call both health endpoints, then submit the sample note through the React interface.

## Current limitations

- Vocabulary and patterns are intentionally small and English-focused.
- Confidence values are deterministic demo heuristics, not calibrated clinical probabilities.
- Entity extraction is not exhaustive and can produce false positives or misses.
- No persistence, user management, audit trail, clinical validation, or real patient-data support exists.

## Future improvements

- Evaluate a suitable de-identified healthcare NER dataset and establish clinical-review criteria.
- Add a validated machine-learning/deep-learning model inside the Python service.
- Add negation, context, abbreviation, and broader terminology handling.
- Create a formal evaluation set and report precision/recall transparently.
- Add privacy, security, authentication, and data-governance measures only if the scope becomes a real product.

## Contributors

Add your project team members here.
