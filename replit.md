# AniXo

AniXo is a free anime streaming web app with search, browse, watchlist, watch progress, and user authentication features powered by AniList and Jikan (MyAnimeList) APIs.

## Run & Operate

- `pnpm --filter @workspace/anixo run dev` — run the frontend (port 19704, preview at `/`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `python3 backup_scraper.py` — run the Python streaming fallback (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (scaffold DB, not used by AniXo auth)
- Required env: `MONGO_URI` — MongoDB connection string for user auth/watchlist/progress
- Required env: `JWT_SECRET` — secret for signing JWTs
- Optional env: `CONSUMET_API` — Consumet API base URL (default: `https://api.consumet.org`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + react-router-dom v7 + TanStack Query
- API: Express 5 + Pino logging
- Python fallback: Flask 3 + flask-cors + requests (`backup_scraper.py`, port 5000)
- Auth DB: MongoDB + Mongoose + bcryptjs + jsonwebtoken
- External APIs: AniList GraphQL, Jikan (MyAnimeList), Miruro, MalSync, Kitsu, Consumet
- Build: esbuild (CJS bundle for API)

## Where things live

- `backup_scraper.py` — Python streaming fallback server (Flask, port 5000)
  - `GET /api/stream?id=&episode=&lang=sub|dub&type=ani|mal` — called by Express `stream.ts` when MegaPlay fails
  - Uses Consumet `meta/anilist` as primary, gogoanime name-search as secondary fallback
  - `requirements.txt` — Python deps (flask, flask-cors, requests, gunicorn)
- `artifacts/anixo/` — React+Vite frontend
  - `src/services/api.js` — AniList/Jikan API calls, backendApi axios instance
  - `src/services/authService.js` — auth REST calls via backendApi
  - `src/store/authStore.jsx` — AuthProvider + AuthContext
  - `src/context/` — LanguageContext, UserListContext, LoadingContext
  - `src/App.jsx` — BrowserRouter + lazy Routes
  - `src/main.tsx` — entry point with all providers
- `artifacts/api-server/` — Express API server
  - `src/app.ts` — Express setup, MongoDB connect, routes registration
  - `src/routes/proxy.ts` — AniList, Jikan, Miruro, MalSync, check-dub, meta/episodes proxies
  - `src/routes/authRoutes.js` — login, register, me, forgot/reset password
  - `src/routes/watchlistRoutes.js`, `progressRoutes.js`, `settingsRoutes.js`, `notificationRoutes.js`

## Architecture decisions

- `backendApi` uses an empty baseURL (same-origin) so auth/watchlist/progress calls route through the Replit proxy to the API server — no hard-coded ports needed.
- `smartRequest()` in api.js uses `PYTHON_API` (HuggingFace space) as base for AniList/Jikan proxy calls — this is the original app's design. The local Express proxy at `/api/*` is a secondary/fallback.
- react-router-dom v7 + BrowserRouter (not RouterProvider) — the app was written for v6 API which is still supported in v7.
- Vite dedupe includes `react`, `react-dom`, `react-router-dom`, `react-router` to prevent duplicate instance bugs.
- index.html entry is `main.tsx` (not the original `main.jsx`) so providers are set up correctly.

## Product

- Landing portal page at `/`
- Home page with hero carousel, trending/popular anime rows, schedule at `/home`
- Browse/search page at `/browse`
- Anime watch page at `/watch/:id`
- Character and staff pages
- Watchlist, profile, settings, continue watching pages
- Email-based auth (register/login/forgot password) stored in MongoDB

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- MongoDB (`MONGO_URI`) must be set for auth to work. Without it, the server starts but all `/auth/*` routes return 401/500.
- `PYTHON_API` env var (HuggingFace space URL) is the primary proxy for AniList/Jikan — defaults to `https://ritesh0997-index.hf.space`.
- The `main.jsx` file still exists but is unused (index.html points to main.tsx).
- Jikan proxy strips leading `/v4` from path params since api.jikan.moe/v4 already includes the version.
- `backup_scraper.py` runs on port 5000 (hardcoded in `stream.ts` — do not change). The frontend artifact runs on port 19704 via the Replit artifact system. Never hardcode port 5000 in `vite.config.ts`.
- Consumet's public API (`api.consumet.org`) can be rate-limited or unreliable. Set `CONSUMET_API` env var to a self-hosted Consumet instance for better reliability.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
