# ManageYourHome

A modern, full‑stack expense sharing platform engineered to make household budgeting effortless and—dare we say—pleasant. With a polished UI, secure authentication, and clear expense breakdowns, ManageYourHome helps families, roommates, and teams stay aligned on spending with near‑zero overhead.

## Highlights
- **Elegant UI:** Crimson + cyan theme with glassmorphism touches, responsive cards, and professional tables.
- **Crystal‑clear expense math:** Per‑item tax and share breakdowns rendered beautifully for fast understanding.
- **Fast & reliable:** React + Vite frontend and Django REST backend deliver snappy UX and robust APIs.
- **Secure by default:** JWT authentication with refresh tokens, rotation, and blacklist support.
- **Frictionless collaboration:** Assign items to people with checkbox‑based user selection using real usernames.
- **Developer‑friendly:** TypeScript everywhere on the client, clean serializers and utils on the server.

> Built to feel “production‑ready” from day one—minimal clicks, maximal clarity.

## Architecture
- **Frontend:** React 18 + TypeScript + Vite, Axios client with JWT interceptor, modern component library.
- **Backend:** Django 5 + Django REST Framework, SQLite dev DB, SimpleJWT.
- **Auth:** Access + Refresh tokens, rotation + blacklist, `Authorization: Bearer <token>`.
- **CORS:** Preconfigured for Vite dev server (`localhost:5173`).

```
frontend/               → React + Vite + TS app
backend/                → Django + DRF API
  routine_app/          → Models, serializers, views, utils
  routine/              → Project settings & URL routing
```

## Core Features
- Create lists, add items, and automatically compute per‑user shares.
- "Shared With" selection uses names (not IDs) via a clean checkbox UI.
- Rich list detail view: totals, tax, subtotal, and per‑item share breakdown.
- Auth flows: register, login, logout, token refresh.
- Professional navigation, empty states, loading indicators.

## Quickstart

### 1) Backend (Django API)
```bash
# From repo root
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-extensions

# Initial DB setup
python manage.py migrate

# Run the API
python manage.py runserver
# API runs at http://127.0.0.1:8000/
```

### 2) Frontend (React + Vite)
```bash
# From repo root
cd frontend
npm install

# Configure API base URL for Vite
echo "VITE_API_URL=http://127.0.0.1:8000" > .env.local

# Start the dev server
npm run dev
# App runs at http://127.0.0.1:5173/
```

## Configuration Notes
- **Frontend API base URL:** set via `VITE_API_URL` env variable; used by Axios.
- **JWT headers:** frontend attaches `Authorization: Bearer <access_token>` automatically.
- **CORS:** enabled for `localhost:5173` and `127.0.0.1:5173`.
- **Permissions:** DRF defaults to authenticated access; login to interact with most endpoints.

## API Overview (Selected)
- `POST /api/user/register/` → Create account
- `POST /api/token/` → Obtain access + refresh
- `POST /api/token/refresh` → Refresh access token
- `GET /api/users/` → List users (id, username, email)
- `GET /api/lists/` → List all your lists
- `POST /api/lists/` → Create a list
- `GET /api/lists/<id>/` → List detail + computed totals
- `POST /api/lists/<list_id>/items/` → Create item (with `brought_to_ids`)
- `GET/PUT/DELETE /api/lists/items/<item_id>/` → Item detail & updates

### Payload Example (Create Item)
```json
{
  "item_name": "Milk",
  "category": "groceries",
  "price": "3.50",
  "brought_to_ids": [1, 2]
}
```

## The Math (Simple & Honest)
Per‑item share is computed server‑side with tax included when applicable. For an item with total price $P$ and N participants, each participant’s share is roughly $\frac{P}{N}$ with careful two‑decimal rounding, ensuring totals match—no penny lost, no penny invented.

## UI Tour
- **Home:** Card grid of lists with item counts and quick actions.
- **List Detail:** Summary cards (Subtotal, Tax, Total) + elegant per‑item share chips.
- **Item Form:** Checkbox‑based user selection using usernames, intuitive multi‑item add.
- **Auth Pages:** Clean, modern, and minimal.

## Development Tips
- Frontend Axios client lives in `src/api/api.tsx`; it reads `VITE_API_URL` and injects JWT automatically.
- Backend settings in `routine/settings.py` control CORS, DRF auth, and SimpleJWT lifetimes.
- Business logic for totals and shares: `backend/routine_app/utils/total_expense.py`.

## Roadmap
- Export to CSV/PDF from list detail
- Role‑aware permissions (owners vs. collaborators)
- Dark mode, themes, and full accessibility polish
- Integrations: calendar reminders, cloud storage

## FAQ
- **Why JWT?** Simple, stateless, and battle‑tested for SPA + API pairs.
- **SQLite in dev?** Yes—fast and portable. Swap to Postgres in prod.
- **Can I deploy this?** Absolutely. Add production settings, HTTPS, and a real DB.

---

Built with care to make shared expenses transparent and stress‑free. If you’re ready for less spreadsheet drama and more clarity, ManageYourHome has your back.
