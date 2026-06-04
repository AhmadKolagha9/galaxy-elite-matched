# Galaxy Elite Private Match

This repository is organized as separate deployable apps:

- `website-galaxy/` - public user website, SEO pages, intake forms, Interest Board, auth entry pages.
- `dashboard-galaxy/` - member dashboard and Galaxy Elite admin/control dashboard.
- `backend/` - TypeScript Express API, RBAC, Supabase/Postgres persistence, document vault, matching APIs.
- `docs/`, `docs1/`, `specs/` - product, handoff, and backend implementation specs.

## Structure

```text
.
├── backend/
├── dashboard-galaxy/
├── website-galaxy/
├── docs/
├── docs1/
├── specs/
├── supabase/
└── galaxy-elite-control-dashboard-dev-handoff/
```

## Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

```text
http://localhost:4000/api/health
```

## Public Website

```bash
cd website-galaxy
npm install
cp .env.example .env.local
npm run dev
```

```text
http://localhost:3000
```

## Dashboard

```bash
cd dashboard-galaxy
npm install
cp .env.example .env.local
npm run dev
```

```text
http://localhost:3000/dashboard
```

For local development, run the website and dashboard on different ports:

```bash
cd website-galaxy && npm run dev -- --port 3000
cd dashboard-galaxy && npm run dev -- --port 3001
```

Root npm scripts are available:

```bash
npm run dev:backend
npm run dev:website
npm run dev:dashboard
npm run typecheck:website
npm run typecheck:dashboard
```
