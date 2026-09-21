# MemoryCare

MemoryCare is a lightweight SIH 2026 proof-of-concept for elderly cognitive support. The main demo lets an elder log in, complete short cognitive games, save progress locally, and lets a caregiver view simple activity insights.

> Demo only. This is not a medical diagnostic or treatment system. Do not enter real patient data.

## Demo flow

```text
Register / Login → Elder Dashboard → Cognitive Games → Saved Results → Caregiver Dashboard
```

The primary demo works without the Python NER service, a database, or external APIs.

## Run the demo

Prerequisites: Node.js 18 or newer and npm.

```bash
npm run install:all
npm run dev:frontend
```

Open `http://localhost:5173` (Vite may choose the next available URL if port 5173 is busy).

The root `npm run dev` command starts the frontend and Express backend together. The backend is not required for the MemoryCare elder/caregiver flow.

## Demo credentials

| Role | Email | Password |
| --- | --- | --- |
| Elder | `elder@memorycare.demo` | `123456` |
| Caregiver | `caregiver@memorycare.demo` | `123456` |

Registration creates additional demo users in the browser's localStorage.

## What to try

1. Log in as the elder and open either Memory Match or Number Sequence.
2. Finish a game and confirm the result appears on the elder dashboard after returning.
3. Log out, log in as the caregiver, and review the recent score and simple insight cards.
4. Refresh the page to confirm the demo session and saved results remain available.
5. Try an incorrect login or a protected route while logged out to see the friendly error/redirect.

Memory Match has four pairs and tracks attempts. Number Sequence has five gentle multiple-choice levels. Results are stored under `memorycare_game_results` in localStorage.

## Existing NER module

The original React → Express → Flask rule-based NER implementation is preserved as a separate/future module. Run it when needed:

```bash
python -m venv .venv
# PowerShell: .\.venv\Scripts\Activate.ps1
pip install -r ner-service/requirements.txt
python ner-service/app.py                 # Python service :8000
npm --prefix backend run dev              # Express gateway :5000
```

The NER page remains available at `/ner` and uses `VITE_API_BASE_URL` (default `http://localhost:5000`). It is intentionally not required by the main MemoryCare demo.

## Validation

```bash
npm --prefix frontend run build
npm --prefix backend run check
python -m unittest discover -s ner-service/tests -v
```

Authentication and game persistence are deliberately demo-only localStorage features. Sample activity shown in the caregiver view is clearly labelled and is replaced by local results once the elder plays a game.
