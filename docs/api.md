# API reference

All endpoints exchange JSON unless otherwise noted. The default local services are Express at `http://localhost:5000` and Python at `http://localhost:8000`.

## Express API

### `GET /api/health`

Returns API availability.

```json
{
  "status": "ok",
  "service": "MemoryCare NER Backend"
}
```

```bash
curl http://localhost:5000/api/health
```

### `POST /api/ner/analyze`

Validates a non-empty text string (up to the demo limit), forwards it to the Python service, and adds summary counts.

Request:

```json
{
  "text": "A fictional 68-year-old individual reports memory loss and takes Donepezil."
}
```

Successful response:

```json
{
  "success": true,
  "entities": [
    {
      "text": "68-year-old",
      "label": "AGE",
      "start": 12,
      "end": 23,
      "confidence": 0.98
    },
    {
      "text": "memory loss",
      "label": "SYMPTOM",
      "start": 43,
      "end": 54,
      "confidence": 0.96
    }
  ],
  "statistics": {
    "total": 2,
    "AGE": 1,
    "SYMPTOM": 1
  }
}
```

```bash
curl -X POST http://localhost:5000/api/ner/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Fictional note: memory loss treated with Donepezil."}'
```

Errors use a user-safe `message` field. Common cases are `400` for missing or invalid text, `413` for a note above the demo limit, `415` for non-JSON input, `502` when the Python NER service is unavailable or returns an invalid response, and `500` for an unexpected server failure.

## Python NER service

### `GET /health`

Returns the extractor service status.

```json
{
  "status": "ok",
  "service": "MemoryCare NER Python Service",
  "mode": "rule-based-demo"
}
```

```bash
curl http://localhost:8000/health
```

### `POST /analyze`

Accepts the same JSON `text` field and returns extracted entities. This internal endpoint intentionally does not provide clinical interpretation, storage, or recommendations.

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Fictional note: MRI of the brain is planned after six months of confusion."}'
```

```json
{
  "success": true,
  "entities": [
    {
      "text": "MRI",
      "label": "PROCEDURE",
      "start": 16,
      "end": 19,
      "confidence": 0.95
    }
  ]
}
```

Invalid bodies return `400`; payloads beyond the service limit return `413`.
