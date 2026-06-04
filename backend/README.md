# Galaxy Elite Private Match Backend

TypeScript Express API for the Galaxy Elite Private Match workspace.

## Run Locally

```bash
npm install
cp .env.example .env
npm run dev
```

The health endpoint is available at:

```text
http://localhost:4000/api/health
```

## Scripts

- `npm run dev` starts the API in watch mode.
- `npm run build` compiles TypeScript to `dist/`.
- `npm run start` runs the compiled API.
- `npm run typecheck` checks TypeScript without emitting files.
