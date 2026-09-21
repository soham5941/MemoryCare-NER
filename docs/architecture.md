# MemoryCare NER architecture

MemoryCare NER uses a deliberately small three-layer design so its data flow is easy to demonstrate and evolve.

```text
React + Vite (http://localhost:5173)
          |
          | POST /api/ner/analyze (JSON)
          v
Express API (http://localhost:5000)
          |
          | POST /analyze (JSON, timeout protected)
          v
Python NER service (http://localhost:8000)
```

## Frontend

The React interface accepts a text note, sends it to the Express API, and presents the returned entities as a table, summary cards, colour-coded source text, and a legend. It does not store notes in a browser database or send them directly to a third party.

## Express API

Express is the browser-facing boundary. It validates request shape and length, permits the configured development frontend through CORS, forwards valid text to Python with a short timeout, and turns service failures into safe, helpful API responses. It also calculates display statistics from the entity list.

## Python NER service

Python owns text extraction. The MVP uses deterministic vocabulary and regular-expression rules, plus preprocessing, overlap resolution, normalisation, confidence assignment, deduplication, and sorting. Its small modules are designed so a validated trained model can later augment or replace the rule engine.

## Why Python is separate

Keeping NLP in Python lets a future version use Python's scientific and machine-learning ecosystem without complicating the Node.js API or React application. The narrow JSON contract means the extraction engine can change independently while the frontend remains stable.

## Privacy and scope

This demo holds text only in the active request and browser state. It has no authentication, patient database, clinical decision logic, or medical advice feature. Do not enter real patient information.
