# QA Environment Setup

Use these values for local QA against the Docker MySQL service. Keep production secrets different and private.

## Local Exports

Generate a real local JWT secret each shell session, or store one only in an untracked local env file.

```bash
export MYSQL_DATABASE_URL='mysql://galaxy_test:galaxy_test_password@127.0.0.1:3307/galaxy_elite_test'
export DATABASE_URL="$MYSQL_DATABASE_URL"
export AUTH_JWT_SECRET="$(openssl rand -hex 32)"
export PRIVATE_DOCUMENT_BUCKET='private-documents'
export CORS_ORIGIN='http://localhost:3000,http://localhost:3001,http://localhost:3100,http://localhost:3101'
export BACKEND_API_URL='http://localhost:4000'
export ADMIN_DASHBOARD_ORIGIN='http://localhost:3001'
export NEXT_PUBLIC_BACKEND_API_URL='http://localhost:4000'
```

Notes:
- Do not use example JWT secrets in production or commit generated secrets.
- `BACKEND_API_URL` and `NEXT_PUBLIC_BACKEND_API_URL` should point at the same local Express API port used by the dashboard or website.
- `ADMIN_DASHBOARD_ORIGIN` must be a specific origin. Do not set it to `*`.
- If you run temporary smoke servers on alternate ports, override only those values for that shell, for example `BACKEND_API_URL=http://127.0.0.1:4100` and `ADMIN_DASHBOARD_ORIGIN=http://127.0.0.1:3102`.

## Validation Commands

```bash
npm --prefix backend run db:migrate
npm run qa:readiness:strict
```

## Clean Migration Rehearsal

For a clean migration rehearsal without resetting the active QA database, create a separate schema and point `MYSQL_DATABASE_URL` at it.

```bash
docker exec galaxy-elite-mysql-test mysql -uroot -pgalaxy_root_password -e "drop database if exists galaxy_elite_clean_test; create database galaxy_elite_clean_test; grant all privileges on galaxy_elite_clean_test.* to 'galaxy_test'@'%'; flush privileges;"
MYSQL_DATABASE_URL='mysql://galaxy_test:galaxy_test_password@127.0.0.1:3307/galaxy_elite_clean_test' npm --prefix backend run db:migrate
```
