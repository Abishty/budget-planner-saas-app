# Budget Planner — Beginner’s Guide

This document explains **how to run the project** and **what each folder does**, step by step. You do not need prior experience with every tool; follow the sections in order.

---

## 1. What is this project?

This is a **budget planning web application** split into two main parts:

| Part | Technology | Role |
|------|------------|------|
| **Frontend** | React (web UI) | What you see in the browser: login, dashboard, transactions, etc. |
| **Backend** | Node.js + Fastify + GraphQL | Receives requests, talks to the database, checks passwords, returns data |
| **Database** | PostgreSQL | Stores users, transactions, budgets, goals, and related data |

The frontend and backend are **separate folders** but belong to one **workspace** (one parent project) so you can install dependencies and run scripts from the root.

---

## 2. What you need installed (prerequisites)

Before you start, install these on your computer:

1. **Node.js** (includes **npm**)  
   - Download: [https://nodejs.org](https://nodejs.org)  
   - Choose a **LTS** version.  
   - After install, open a terminal and check:
     ```bash
     node -v
     npm -v
     ```
   - You should see version numbers (no errors).

2. **PostgreSQL** (the database) — *one of these options is enough*  
   - **Option A — Docker (recommended for beginners):** Install [Docker Desktop](https://www.docker.com/products/docker-desktop/). You will start the database with one command (see below).  
   - **Option B — Local PostgreSQL:** Install PostgreSQL yourself and create a database. You must set `DATABASE_URL` in `backend/.env` to match your install.

3. **A code editor** (optional but helpful)  
   - e.g. VS Code or Cursor.

You do **not** need to install Redis to run the basics; Redis is defined in Docker for future features (caching, etc.).

---

## 3. How to run the project (point by point)

Do these steps **in order** the first time.

### Step 1 — Open a terminal in the project folder

- Navigate to the folder that contains `package.json` at the **root** (not inside `backend` or `frontend` yet).  
- Example path: `D:\Projects\budget-planner-saas-app`

### Step 2 — Install all dependencies

From the **root** folder, run:

```bash
npm install
```

**What this does:** npm reads the root `package.json`, sees **workspaces** (`backend` and `frontend`), and installs packages for the root, backend, and frontend.  
**First run may take a few minutes** — that is normal.

### Step 3 — Environment variables (`.env` files)

The app needs configuration (database URL, secrets, URLs).

1. At the **root**, open `.env.example`. It describes what each variable means.  
2. **Backend** needs `backend/.env`.  
   - If `backend/.env` does not exist, create it.  
   - Copy the values from `.env.example` or use the same idea as below.

**Typical `backend/.env` for local development (Docker Postgres):**

```env
DATABASE_URL="postgresql://budget:budget@localhost:5432/budget_planner?schema=public"
JWT_SECRET="use-a-long-random-string-at-least-32-characters"
PORT=4000
CORS_ORIGIN="http://localhost:5173"
```

- **`DATABASE_URL`** — How the backend connects to PostgreSQL (user, password, host, port, database name).  
- **`JWT_SECRET`** — Used to sign login tokens. **Change this in production**; keep it private.  
- **`PORT`** — Backend HTTP port (default `4000`).  
- **`CORS_ORIGIN`** — Browser address of the frontend (Vite default is `http://localhost:5173`).

**Typical `frontend/.env`:**

```env
VITE_GRAPHQL_URL="http://localhost:4000/graphql"
```

- Tells the React app **where the GraphQL API lives**.

> **Security note:** Never commit real `.env` files to public Git repos. This project’s `.gitignore` is set to ignore `.env` files.

### Step 4 — Start PostgreSQL

**If you use Docker** (and `docker-compose.yml` at the root):

```bash
docker compose up -d postgres
```

**What this does:** Starts a PostgreSQL container with user `budget`, password `budget`, database `budget_planner`, matching the sample `DATABASE_URL` above.

**If you use your own PostgreSQL:** Create a database and user, then set `DATABASE_URL` in `backend/.env` accordingly.

### Step 5 — Create the database tables (Prisma)

The **schema** (tables and columns) is defined in `backend/prisma/schema.prisma`.  
You must **apply** that schema to your database once (and again after schema changes).

From the **root**:

```bash
npm run db:push
```

**What this does:** Runs Prisma against your database and creates/updates tables to match the schema.

**Alternative (migrations, common in teams):**

```bash
cd backend
npx prisma migrate dev
```

Follow the prompts to name your migration.

**Optional — open a visual database browser:**

```bash
cd backend
npx prisma studio
```

### Step 6 — Start the app (backend + frontend together)

From the **root**:

```bash
npm run dev
```

**What this does:** Runs **two processes** at once:

- **Backend** — GraphQL API (often `http://localhost:4000`)  
- **Frontend** — Vite dev server (often `http://localhost:5173`)

### Step 7 — Use the app in the browser

1. Open: **http://localhost:5173**  
2. **Register** a new account (or **log in** if you already have one).  
3. Explore **Dashboard**, **Transactions**, **Budgets**, **Goals**, **Settings**.

**Useful URLs:**

| URL | Purpose |
|-----|---------|
| `http://localhost:5173` | Web app (React) |
| `http://localhost:4000/graphql` | GraphQL endpoint |
| `http://localhost:4000/graphiql` | GraphiQL (interactive GraphQL UI) when not in production mode |
| `http://localhost:4000/health` | Simple health check (`{"ok":true}`) |

---

## 4. Other useful commands (cheat sheet)

Run from the **root** unless noted.

| Command | What it does |
|---------|----------------|
| `npm run dev` | Starts backend + frontend in development mode |
| `npm run db:up` | Starts Docker services from `docker-compose.yml` (Postgres + Redis) |
| `npm run db:generate` | Regenerates Prisma Client after `schema.prisma` changes |
| `npm run db:push` | Pushes schema to the database (good for local dev) |
| `npm run build` | Builds backend (`tsc`) and frontend (Vite production build) |

**Backend only** (from `backend/`):

| Command | What it does |
|---------|----------------|
| `npm run dev` | Backend only, with file watch (`tsx watch`) |
| `npm run build` | Compile TypeScript to `backend/dist` |
| `npm start` | Run compiled JS (after `build`) |

**Frontend only** (from `frontend/`):

| Command | What it does |
|---------|----------------|
| `npm run dev` | Frontend only (Vite) |
| `npm run build` | Production build → `frontend/dist` |
| `npm run preview` | Preview the production build locally |

---

## 5. High-level flow (how a click becomes data)

A simple way to picture the system:

```
Browser (React)
    → sends GraphQL request (Apollo Client) with JWT if logged in
        → Backend (Fastify + Mercurius)
            → runs resolver (business logic)
                → Prisma ORM
                    → PostgreSQL (reads/writes rows)
            ← returns JSON (GraphQL response)
    ← React updates the screen
```

- **JWT** = a signed token stored in the browser after login; the backend uses it to know **which user** is asking for data.

---

## 6. Project file structure (what lives where)

Below is the **logical** layout. Folders like `node_modules` and `dist` are **generated** — you normally do not edit them.

```
budget-planner-saas-app/
├── package.json              # Root workspace: scripts to run both apps
├── package-lock.json         # Locked dependency versions (commit this for teams)
├── docker-compose.yml        # Postgres + Redis containers (optional Redis for now)
├── .env.example              # Documents required environment variables
├── .gitignore                # Files Git should ignore (e.g. node_modules, .env)
├── CLAUDE.md                 # High-level product / architecture notes
├── GETTING_STARTED.md        # This file
│
├── backend/                  # Server (API + database access)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                  # Local secrets (create yourself; not in Git)
│   ├── prisma/
│   │   └── schema.prisma     # Database models (tables, relations)
│   └── src/
│       ├── index.ts          # Starts Fastify, registers GraphQL + CORS + health route
│       ├── db/
│       │   └── prisma.ts     # Single PrismaClient instance (DB connection)
│       ├── lib/
│       │   └── auth.ts       # Password hashing + JWT sign/verify
│       └── graphql/
│           ├── schema.ts     # GraphQL type definitions (SDL strings)
│           ├── context.ts    # Builds per-request context (user id from JWT)
│           └── resolvers/
│               └── index.ts  # Query/Mutation implementations (calls Prisma)
│
└── frontend/                 # Browser UI
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts        # Vite config (dev server, Tailwind plugin, proxy)
    ├── index.html            # HTML shell; loads React
    ├── .env                  # VITE_* variables (create from .env.example ideas)
    ├── public/               # Static files copied as-is (favicons, etc.)
    └── src/
        ├── main.tsx          # React entry: Apollo, Redux, Router, CSS
        ├── App.tsx           # Route definitions (pages + protected layout)
        ├── index.css         # Global styles + Tailwind
        ├── apollo/
        │   └── client.ts     # Apollo Client (GraphQL URL + auth header)
        ├── graphql/
        │   └── operations.ts # GraphQL queries/mutations used by the UI
        ├── store/            # Redux store (e.g. auth slice: token, user)
        ├── hooks.ts          # Typed Redux hooks
        ├── types/
        │   └── api.ts        # TypeScript shapes for API data (UI helpers)
        ├── components/       # Reusable UI (layout, auth guard, theme)
        └── pages/            # Full screens (Login, Dashboard, Transactions, …)
```

---

## 7. Folder responsibilities (beginner-friendly)

### Root folder

| Item | Responsibility |
|------|----------------|
| `package.json` | Defines **workspaces** and shortcuts like `npm run dev` that start backend + frontend together. |
| `docker-compose.yml` | Defines **Postgres** (and **Redis** for later). One place to “turn on” infrastructure. |
| `.env.example` | **Documentation** for environment variables — copy ideas into real `.env` files. |

### `backend/`

| Path | Responsibility |
|------|----------------|
| `src/index.ts` | **Entry point:** creates the HTTP server, connects GraphQL, security headers (Helmet), CORS, `/health`. |
| `src/db/prisma.ts` | **Database client** — import this anywhere you need to read/write the DB via Prisma. |
| `src/lib/auth.ts` | **Security helpers** — hash passwords, create JWTs, verify JWTs. |
| `src/graphql/schema.ts` | **API contract** — what queries and mutations exist and what types they use (GraphQL schema as text). |
| `src/graphql/context.ts` | **Per request** — reads `Authorization: Bearer …` header and attaches `userId` (or null) for resolvers. |
| `src/graphql/resolvers/index.ts` | **Business logic** — when someone calls `login` or `transactions`, this code runs and uses Prisma. |
| `prisma/schema.prisma` | **Data model** — tables, fields, relations. Changing this means you must run `db:push` or `migrate` again. |

### `frontend/`

| Path | Responsibility |
|------|----------------|
| `index.html` | The single HTML page; React mounts into the `#root` div. |
| `vite.config.ts` | **Build & dev server** — React plugin, Tailwind, optional proxy to backend. |
| `src/main.tsx` | **Bootstraps React** — wraps the app with Apollo (data), Redux (state), Router (URLs). |
| `src/App.tsx` | **Routes** — which URL shows which page; which routes require login. |
| `src/apollo/client.ts` | **GraphQL client** — where to send requests and how to attach the login token. |
| `src/graphql/operations.ts` | **Queries & mutations** — the exact GraphQL strings the UI uses. |
| `src/store/` | **Redux** — global client state (mainly **auth**: token + user profile). |
| `src/components/` | **Shared pieces** — sidebar layout, “must be logged in” gate, theme sync. |
| `src/pages/` | **Screens** — one file per main view (Dashboard, Transactions, etc.). |
| `src/types/api.ts` | **TypeScript types** that match API data shapes (helps the editor catch mistakes). |

### Generated / install folders (do not hand-edit)

| Folder | What it is |
|--------|------------|
| `node_modules/` | Downloaded libraries — huge; recreated with `npm install`. |
| `backend/dist/` | Compiled JavaScript from TypeScript (`npm run build` in backend). |
| `frontend/dist/` | Production build of the website (`npm run build` in frontend). |

---

## 8. Troubleshooting (common beginner issues)

| Problem | Things to check |
|---------|------------------|
| `npm install` errors | Node version (use LTS). Delete `node_modules` and `package-lock.json` only if a maintainer suggests it; usually not needed first try. |
| Backend exits: “Missing DATABASE_URL or JWT_SECRET” | `backend/.env` exists and contains both variables. |
| “Can’t reach database” / Prisma errors | Postgres is running (`docker compose ps` or your local service). `DATABASE_URL` host/port/user/password/database name match reality. |
| Frontend blank / CORS errors | `CORS_ORIGIN` in `backend/.env` matches the frontend URL exactly (including `http` vs `https` and port). |
| Login works but data fails | Token in `localStorage` — try log out and log in again. Check backend logs in the terminal. |
| Port already in use | Another app uses `4000` or `5173`. Change `PORT` in `backend/.env` or stop the other process. |

---

## 9. Where to read more

- **Prisma:** [https://www.prisma.io/docs](https://www.prisma.io/docs)  
- **Mercurius (GraphQL on Fastify):** [https://mercurius.dev](https://mercurius.dev)  
- **Vite:** [https://vitejs.dev](https://vitejs.dev)  
- **React:** [https://react.dev](https://react.dev)  

---

You are now set up to **run the project**, **know which folder to open for a given change**, and **understand the path from the UI to the database**. If something in this guide does not match your machine (different OS or Docker setup), adjust only the paths and `DATABASE_URL`; the folder roles stay the same.
